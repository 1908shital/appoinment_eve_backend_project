import * as bookingService from "../services/booking.service.js";

export const createBooking = async (req, res) => {
  try {
    const { user_id, slot_id } = req.body;
    const booking = await bookingService.createBooking(user_id, slot_id);
    return res.status(201).json({
      success: true,
      message: "Booking created successfully with pending status",
      data: booking,
    });
  } catch (error) {
    const isLockedOrBooked = error.message.toLowerCase().includes("locked") || error.message.toLowerCase().includes("not available");
    return res.status(isLockedOrBooked ? 409 : 400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    const bookings = await bookingService.getBookings(userId);
    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);
    return res.status(200).json({
      success: true,
      message: "Booking details retrieved successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const canceledBooking = await bookingService.cancelBooking(id);
    return res.status(200).json({
      success: true,
      message: "Booking canceled successfully",
      data: canceledBooking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
