import prisma from "../config/prisma.js";
import redis from "../config/redis.js";
import {
  formatDate,
  formatTime,
  getSlotLockKey,
  getSlotLockKeyDetailed,
  getSlotLockKeyBasic,
} from "../utils/redisKeys.util.js";

/**
 * Create a new pending booking for a slot.
 * Locks the slot in Redis for 10 minutes (TTL 600s).
 * Slot status in DB remains open/pending until payment completion.
 */
export const createBooking = async (userId, slotId) => {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      diagnosticCenterTest: {
        include: {
          diagnosticCenter: true,
          test: true,
        },
      },
    },
  });

  if (!slot) {
    throw new Error("Slot not found");
  }

  if (slot.status !== "open") {
    throw new Error("Slot is not available for booking");
  }

  const slotLockKey = getSlotLockKey(slotId);
  const dateStr = formatDate(slot.startTime);
  const timeStr = formatTime(slot.startTime);
  const centerId = slot.diagnosticCenterTest.diagnosticCenterId;
  const testId = slot.diagnosticCenterTest.testId;

  const lockKeyBasic = getSlotLockKeyBasic(slotId, dateStr, timeStr);
  const lockKeyDetailed = getSlotLockKeyDetailed(slotId, dateStr, timeStr, centerId, testId);

  let lockAcquired = false;
  try {
    // Acquire 10-minute (600 seconds) Redis lock
    const lockResult = await redis.set(slotLockKey, userId, "EX", 600, "NX");
    if (lockResult === "OK") {
      lockAcquired = true;
      await redis.set(lockKeyBasic, userId, "EX", 600, "NX");
      await redis.set(lockKeyDetailed, userId, "EX", 600, "NX");
    }
  } catch (err) {
    console.warn("[Redis Lock Warning] Redis unreachable, using DB check:", err.message);
    lockAcquired = true;
  }

  if (!lockAcquired) {
    throw new Error("Slot is currently locked by another booking attempt (TTL: 10 mins). Please try another slot.");
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        slotId,
        status: "pending",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        slot: {
          include: {
            diagnosticCenterTest: {
              include: {
                diagnosticCenter: true,
                test: true,
              },
            },
          },
        },
      },
    });

    return booking;
  } catch (error) {
    try {
      await redis.del(slotLockKey);
      await redis.del(lockKeyDetailed);
      await redis.del(lockKeyBasic);
    } catch (err) {
      console.warn("[Redis Lock Release Error]", err.message);
    }
    throw error;
  }
};

export const getBookings = async (userId) => {
  const where = {};
  if (userId) {
    where.userId = userId;
  }

  return await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      slot: {
        include: {
          diagnosticCenterTest: {
            include: {
              diagnosticCenter: true,
              test: true,
            },
          },
        },
      },
      payment: true,
    },
  });
};

export const getBookingById = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      slot: {
        include: {
          diagnosticCenterTest: {
            include: {
              diagnosticCenter: true,
              test: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

export const cancelBooking = async (id) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status === "canceled") {
    throw new Error("Booking is already canceled");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: "canceled" },
      });

      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: "open" },
      });

      return updated;
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );

  try {
    const slotLockKey = getSlotLockKey(booking.slotId);
    await redis.del(slotLockKey);
  } catch (err) {
    console.warn("[Redis Lock Release Warning]", err.message);
  }

  return result;
};
