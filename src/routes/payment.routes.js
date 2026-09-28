const express = require("express");
const paymentController = require("../controllers/payment.controller");
const validate = require("../middleware/validation.middleware");
const { createPaymentSchema, webhookSchema } = require("../schemas/payment.schema");

const router = express.Router();

router.post("/", validate(createPaymentSchema), paymentController.createPayment);
router.post("/webhook", validate(webhookSchema), paymentController.handleWebhook);
router.get("/:id", paymentController.getPaymentById);

module.exports = router;
