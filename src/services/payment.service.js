import prisma from "../config/prisma.js";
import redis from "../config/redis.js";
import { getSlotLockKey } from "../utils/redisKeys.util.js";

export const createPayment = async (bookingId, mop, amount) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true },
  });

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

export const handleWebhook = async (eventId, paymentId, status, receipt = null) => {
  const existingEvent = await prisma.payment.findFirst({
    where: { eventId },
  });

  if (existingEvent) {
    return {
      alreadyProcessed: true,
      message: "Webhook event already processed (Idempotent call)",
      payment: existingEvent,
    };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { bookings: true },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  const isSuccess = status.toLowerCase() === "success";

  const result = await prisma.$transaction(
    async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          eventId,
          status: status.toLowerCase(),
          receipt: receipt || `REC-${Date.now()}`,
        },
      });

      const targetBookingStatus = isSuccess ? "booked" : "canceled";

      await tx.booking.updateMany({
        where: { paymentId: paymentId },
        data: { status: targetBookingStatus },
      });

      for (const booking of payment.bookings) {
        if (isSuccess) {
          // Confirm slot as booked in database upon successful payment
          await tx.availabilitySlot.update({
            where: { id: booking.slotId },
            data: { status: "booked" },
          });
        }
      }

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

  // Release Redis locks for all associated slots
  for (const booking of payment.bookings) {
    try {
      const slotLockKey = getSlotLockKey(booking.slotId);
      await redis.del(slotLockKey);
    } catch (err) {
      console.warn("[Redis Lock Release Warning]", err.message);
    }
  }

  return result;
};

export const getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
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
