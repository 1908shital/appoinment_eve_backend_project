const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

const signup = async (name, email, password, extraData = {}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await userRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashedPassword,
    phoneNumber: extraData.phone_number || extraData.phoneNumber,
    address: extraData.address,
    age: extraData.age,
    gender: extraData.gender,
    relationshipStatus: extraData.relationship_status || extraData.relationshipStatus,
  });

  return user;
};

const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await userRepository.findUserByEmail(normalizedEmail);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  const { passwordHash, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

module.exports = {
  signup,
  login,
  getUserById,
};