const createTestSchema = {
  name: { required: true },
  description: { required: false },
  disease: { required: false },
};

const updateTestSchema = {
  name: { required: false },
  description: { required: false },
  disease: { required: false },
};

module.exports = {
  createTestSchema,
  updateTestSchema,
};
