import * as paymentService from "../services/payment.service.js";

export const createPayment = async (req, res) => {
  try {
    const { booking_id, mop, amount } = req.body;
    const payment = await paymentService.createPayment(booking_id, mop, amount);
    return res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const { event_id, payment_id, status, receipt } = req.body;
    const result = await paymentService.handleWebhook(
      event_id,
      payment_id,
      status,
      receipt
    );
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        already_processed: result.alreadyProcessed,
        payment: result.payment,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);
    return res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
