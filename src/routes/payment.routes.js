import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import validate from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/", validate(["booking_id", "mop", "amount"]), paymentController.createPayment);
router.post("/webhook", validate(["event_id", "payment_id", "status"]), paymentController.handleWebhook);
router.get("/:id", paymentController.getPaymentById);

export default router;
