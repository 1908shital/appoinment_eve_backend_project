import express from "express";
import * as bookingController from "../controllers/booking.controller.js";
import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, validate(["user_id", "slot_id"]), bookingController.createBooking);
router.get("/", authMiddleware, bookingController.getBookings);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);

export default router;
