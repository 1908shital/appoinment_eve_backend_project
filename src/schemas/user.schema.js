const signupSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
};

const loginSchema = {
  email: { required: true },
  password: { required: true },
};

module.exports = {
  signupSchema,
  loginSchema,
};