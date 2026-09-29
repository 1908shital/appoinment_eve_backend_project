import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "DiagBooking@2026#SecretKey";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{10,18}$/;

export const signup = async (name, email, password, extraData = {}) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate Email
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error("Invalid email address format (e.g. user@example.com)");
  }

  // Validate Password Length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Validate Phone Number if provided
  const phone = extraData.phone_number || extraData.phoneNumber;
  if (phone && !PHONE_REGEX.test(phone.toString().trim())) {
    throw new Error("Invalid phone number format (must contain 10-15 digits)");
  }

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
      phoneNumber: phone ? phone.toString().trim() : null,
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

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error("Invalid email address format");
  }

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
    { expiresIn: "1d" }
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