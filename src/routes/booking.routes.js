import express from "express";
import * as bookingController from "../controllers/booking.controller.js";
import validate from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/", validate(["user_id", "slot_id"]), bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/:id", bookingController.getBookingById);
router.patch("/:id/cancel", bookingController.cancelBooking);

export default router;
