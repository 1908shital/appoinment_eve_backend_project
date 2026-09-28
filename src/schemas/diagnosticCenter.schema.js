const createCenterSchema = {
  name: { required: true },
  location: { required: true },
};

const updateCenterSchema = {
  name: { required: false },
  location: { required: false },
};

module.exports = {
  createCenterSchema,
  updateCenterSchema,
};
