const createBookingSchema = {
  slot_id: { required: true },
};

const updateBookingStatusSchema = {
  status: { required: true },
};

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
};
