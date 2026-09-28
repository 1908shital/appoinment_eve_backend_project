const { AvailabilitySlot, DiagnosticCenterTest } = require("../models");

const createSlot = async (diagnosticCenterTestId, startTime, endTime) => {
  const centerTest = await DiagnosticCenterTest.findUnique({
    where: { id: diagnosticCenterTestId },
  });
  if (!centerTest) {
    throw new Error("Diagnostic Center Test not found");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  return await AvailabilitySlot.create({
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
};

const getSlots = async (filter = {}) => {
  const where = {};
  if (filter.centerTestId) {
    where.diagnosticCenterTestId = filter.centerTestId;
  }
  if (filter.status) {
    where.status = filter.status;
  }

  return await AvailabilitySlot.findMany({
    where,
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
};

const getSlotById = async (id) => {
  const slot = await AvailabilitySlot.findUnique({
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

const updateSlotStatus = async (id, status) => {
  const slot = await AvailabilitySlot.findUnique({ where: { id } });
  if (!slot) {
    throw new Error("Availability Slot not found");
  }

  return await AvailabilitySlot.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createSlot,
  getSlots,
  getSlotById,
  updateSlotStatus,
};
