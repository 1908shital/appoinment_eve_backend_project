const { prisma, Booking, AvailabilitySlot } = require("../models");

const createBooking = async (userId, slotId) => {
  const slot = await AvailabilitySlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new Error("Slot not found");
  }

  if (slot.status !== "open") {
    throw new Error("Slot is not available for booking");
  }

  // Create booking & update slot in transaction with increased timeout
  return await prisma.$transaction(
    async (tx) => {
      const booking = await tx.booking.create({
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

      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: { status: "booked" },
      });

      return booking;
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
};

const getBookings = async (userId) => {
  const where = {};
  if (userId) {
    where.userId = userId;
  }

  return await Booking.findMany({
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

const getBookingById = async (id) => {
  const booking = await Booking.findUnique({
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

const cancelBooking = async (id) => {
  const booking = await Booking.findUnique({ where: { id } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status === "canceled") {
    throw new Error("Booking is already canceled");
  }

  return await prisma.$transaction(
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
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
};
