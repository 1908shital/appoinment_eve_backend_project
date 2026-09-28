const bookingService = require("../services/booking.service");

const createBooking = async (req, res) => {
  try {
    const { slot_id, user_id } = req.body;
    // user_id can come from req.user if auth middleware is present or req.body for flexibility
    const effectiveUserId = (req.user && req.user.userId) || user_id;

    if (!effectiveUserId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const booking = await bookingService.createBooking(effectiveUserId, slot_id);
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const userId = (req.user && req.user.userId) || req.query.user_id;
    const bookings = await bookingService.getBookings(userId);
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);
    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const canceled = await bookingService.cancelBooking(id);
    return res.status(200).json({
      success: true,
      message: "Booking canceled successfully",
      data: canceled,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
};
