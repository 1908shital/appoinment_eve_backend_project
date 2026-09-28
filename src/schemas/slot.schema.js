const createSlotSchema = {
  diagnostic_center_test_id: { required: true },
  start_time: { required: true },
  end_time: { required: true },
};

const updateSlotStatusSchema = {
  status: { required: true },
};

module.exports = {
  createSlotSchema,
  updateSlotStatusSchema,
};
