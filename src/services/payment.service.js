const { prisma, Payment, Booking } = require("../models");

const createPayment = async (bookingId, mop, amount) => {
  const booking = await Booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  return await prisma.$transaction(
    async (tx) => {
      const payment = await tx.payment.create({
        data: {
          mop: mop.toUpperCase(),
          amount: parseFloat(amount),
          status: "pending",
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { paymentId: payment.id },
      });

      return payment;
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
};

const handleWebhook = async (eventId, paymentId, status, receipt = null) => {
  // Check idempotency by eventId
  const existingEvent = await Payment.findFirst({
    where: { eventId },
  });

  if (existingEvent) {
    return {
      alreadyProcessed: true,
      message: "Webhook event already processed (Idempotent call)",
      payment: existingEvent,
    };
  }

  const payment = await Payment.findUnique({
    where: { id: paymentId },
    include: { bookings: true },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  return await prisma.$transaction(
    async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          eventId,
          status: status.toLowerCase(),
          receipt: receipt || `REC-${Date.now()}`,
        },
      });

      const targetBookingStatus = status.toLowerCase() === "success" ? "booked" : "canceled";

      await tx.booking.updateMany({
        where: { paymentId: paymentId },
        data: { status: targetBookingStatus },
      });

      return {
        alreadyProcessed: false,
        message: "Webhook event processed successfully",
        payment: updatedPayment,
      };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
};

const getPaymentById = async (id) => {
  const payment = await Payment.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          slot: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  return payment;
};

module.exports = {
  createPayment,
  handleWebhook,
  getPaymentById,
};
