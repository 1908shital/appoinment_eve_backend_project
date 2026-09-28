const prisma = require("../config/prisma");

module.exports = {
  prisma,
  User: prisma.user,
  DiagnosticCenter: prisma.diagnosticCenter,
  Test: prisma.test,
  DiagnosticCenterTest: prisma.diagnosticCenterTest,
  AvailabilitySlot: prisma.availabilitySlot,
  Payment: prisma.payment,
  Booking: prisma.booking,
};
