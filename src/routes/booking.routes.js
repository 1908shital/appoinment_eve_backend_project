const express = require("express");
const bookingController = require("../controllers/booking.controller");
const validate = require("../middleware/validation.middleware");
const { createBookingSchema } = require("../schemas/booking.schema");

const router = express.Router();

router.post("/", validate(createBookingSchema), bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/:id", bookingController.getBookingById);
router.patch("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
