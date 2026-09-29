import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export const signup = async (name, email, password, extraData = {}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      phoneNumber: extraData.phone_number || extraData.phoneNumber || null,
      address: extraData.address || null,
      age: extraData.age ? parseInt(extraData.age, 10) : null,
      gender: extraData.gender || null,
      relationshipStatus: extraData.relationship_status || extraData.relationshipStatus || null,
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

  return user;
};

export const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

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

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
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

  if (!user) {
    throw new Error("User not found");
  }
  return user;
};