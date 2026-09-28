const { User } = require("../models");

const findUserByEmail = async (email) => {
  return await User.findUnique({
    where: { email },
  });
};

const createUser = async (userData) => {
  const { name, email, passwordHash, phoneNumber, address, age, gender, relationshipStatus } = userData;
  return await User.create({
    data: {
      name,
      email,
      passwordHash,
      phoneNumber,
      address,
      age: age ? parseInt(age, 10) : undefined,
      gender,
      relationshipStatus,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      age: true,
      gender: true,
      relationshipStatus: true,
      createdAt: true,
    },
  });
};

const findUserById = async (id) => {
  return await User.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      age: true,
      gender: true,
      relationshipStatus: true,
      createdAt: true,
      bookings: true,
    },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};