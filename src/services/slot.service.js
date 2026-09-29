import prisma from "../config/prisma.js";
import redis from "../config/redis.js";
import {
  formatDate,
  formatTime,
  getSlotByTestKey,
  getSlotByCenterKey,
  getSlotLockKey,
} from "../utils/redisKeys.util.js";

/**
 * Filter out any slots that are currently locked in Redis (10-min TTL lock).
 * Returns only slots that have NO active Redis lock key.
 */
export const filterUnlockedSlots = async (slots) => {
  if (!slots || slots.length === 0) return [];

  try {
    const lockKeys = slots.map((s) => getSlotLockKey(s.id));
    const lockStatuses = await redis.mget(...lockKeys);

    return slots.filter((slot, index) => !lockStatuses[index]);
  } catch (err) {
    console.warn("[Redis Filter Warning] Lock check failed, returning all slots:", err.message);
    return slots;
  }
};

export const createSlot = async (diagnosticCenterTestId, startTime, endTime) => {
  const centerTest = await prisma.diagnosticCenterTest.findUnique({
    where: { id: diagnosticCenterTestId },
    include: {
      diagnosticCenter: true,
      test: true,
    },
  });
  if (!centerTest) {
    throw new Error("Diagnostic Center Test not found");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const newSlot = await prisma.availabilitySlot.create({
    data: {
      diagnosticCenterTestId,
      startTime: start,
      endTime: end,
      status: "open",
    },
    include: {
      diagnosticCenterTest: {
        include: {
          diagnosticCenter: true,
          test: true,
        },
      },
    },
  });

  try {
    const dateStr = formatDate(start);
    const timeStr = formatTime(start);
    const testName = centerTest.test.name;
    const centerName = centerTest.diagnosticCenter.name;
    const price = parseFloat(centerTest.price);

    const slotTestKey = getSlotByTestKey(testName, dateStr, timeStr);
    const testCenterData = {
      centerId: centerTest.diagnosticCenter.id,
      centerName,
      slotId: newSlot.id,
      price,
    };
    await redis.set(slotTestKey, JSON.stringify([testCenterData]), "EX", 600);

    const slotCenterKey = getSlotByCenterKey(centerName, dateStr, timeStr);
    const centerTestData = {
      testId: centerTest.test.id,
      testName,
      slotId: newSlot.id,
      price,
    };
    await redis.set(slotCenterKey, JSON.stringify([centerTestData]), "EX", 600);
  } catch (err) {
    console.warn("[Redis Cache Error]", err.message);
  }

  return newSlot;
};

export const getSlots = async (filter = {}, skip = 0, limit = 10) => {
  const where = {};
  if (filter.centerTestId) {
    where.diagnosticCenterTestId = filter.centerTestId;
  }
  if (filter.status) {
    where.status = filter.status;
  }

  const totalCount = await prisma.availabilitySlot.count({ where });
  const rawSlots = await prisma.availabilitySlot.findMany({
    where,
    skip,
    take: limit,
    orderBy: { startTime: "asc" },
    include: {
      diagnosticCenterTest: {
        include: {
          diagnosticCenter: true,
          test: true,
        },
      },
    },
  });

  // Filter out any slot locked in Redis
  const slots = await filterUnlockedSlots(rawSlots);
  return { slots, totalCount };
};

export const getSlotById = async (id) => {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id },
    include: {
      diagnosticCenterTest: {
        include: {
          diagnosticCenter: true,
          test: true,
        },
      },
      bookings: true,
    },
  });
  if (!slot) {
    throw new Error("Availability Slot not found");
  }
  return slot;
};

export const getSlotsByCenterAndTest = async (diagnosticCenterId, testId) => {
  const centerTest = await prisma.diagnosticCenterTest.findFirst({
    where: {
      diagnosticCenterId,
      testId,
    },
  });

  if (!centerTest) {
    throw new Error("No diagnostic center test mapping found for given center and test IDs");
  }

  const rawSlots = await prisma.availabilitySlot.findMany({
    where: {
      diagnosticCenterTestId: centerTest.id,
      status: "open",
    },
    orderBy: { startTime: "asc" },
    include: {
      diagnosticCenterTest: {
        include: {
          diagnosticCenter: true,
          test: true,
        },
      },
    },
  });

  // Filter out any slots currently locked in Redis
  const availableSlots = await filterUnlockedSlots(rawSlots);

  return {
    source: "database",
    data: availableSlots,
  };
};

export const updateSlotStatus = async (id, status) => {
  const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
  if (!slot) {
    throw new Error("Availability Slot not found");
  }

  return await prisma.availabilitySlot.update({
    where: { id },
    data: { status },
  });
};

/**
 * Generate 1-hour availability slots for the next 7 days (10:00 AM IST to 06:00 PM IST)
 * for all registered DiagnosticCenterTest entries.
 */
export const generateSlotsForNext7Days = async () => {
  const centerTests = await prisma.diagnosticCenterTest.findMany();
  let createdCount = 0;

  // Operating hours: 10 AM to 6 PM IST (8 1-hour slots starting at 10, 11, 12, 13, 14, 15, 16, 17)
  const operatingHours = [10, 11, 12, 13, 14, 15, 16, 17];
  const today = new Date();

  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    for (const hour of operatingHours) {
      const startHourStr = String(hour).padStart(2, "0");
      const endHourStr = String(hour + 1).padStart(2, "0");

      // Construct ISO timestamp explicitly with IST (+05:30) offset
      const startIsoStr = `${dateStr}T${startHourStr}:00:00+05:30`;
      const endIsoStr = `${dateStr}T${endHourStr}:00:00+05:30`;

      const startTime = new Date(startIsoStr);
      const endTime = new Date(endIsoStr);

      for (const ct of centerTests) {
        const existing = await prisma.availabilitySlot.findFirst({
          where: {
            diagnosticCenterTestId: ct.id,
            startTime: startTime,
          },
        });

        if (!existing) {
          await prisma.availabilitySlot.create({
            data: {
              diagnosticCenterTestId: ct.id,
              startTime,
              endTime,
              status: "open",
            },
          });
          createdCount++;
        }
      }
    }
  }

  console.log(`[Slot Cron] Successfully generated ${createdCount} new 1-hour availability slots for the next 7 days.`);
  return createdCount;
};
