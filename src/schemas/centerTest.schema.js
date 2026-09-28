const createCenterTestSchema = {
  diagnostic_center_id: { required: true },
  test_id: { required: true },
  price: { required: true },
};

const updateCenterTestSchema = {
  price: { required: true },
};

module.exports = {
  createCenterTestSchema,
  updateCenterTestSchema,
};
