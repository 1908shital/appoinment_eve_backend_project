import prisma from "../config/prisma.js";
import redis from "../config/redis.js";

export const createCenterTest = async (diagnosticCenterId, testId, price) => {
  const existing = await prisma.diagnosticCenterTest.findUnique({
    where: {
      diagnosticCenterId_testId: {
        diagnosticCenterId,
        testId,
      },
    },
  });

  if (existing) {
    throw new Error("This diagnostic center test mapping already exists");
  }

  const newMapping = await prisma.diagnosticCenterTest.create({
    data: {
      diagnosticCenterId,
      testId,
      price: parseFloat(price),
    },
    include: {
      diagnosticCenter: true,
      test: true,
    },
  });

  try {
    await redis.del(`center:tests:${diagnosticCenterId}`);
    await redis.del(`test:centers:${testId}`);
  } catch (err) {
    console.warn("[Redis Cache Invalidation Warning]", err.message);
  }

  return newMapping;
};

export const getAllCenterTests = async (skip = 0, limit = 10) => {
  const totalCount = await prisma.diagnosticCenterTest.count();
  const centerTests = await prisma.diagnosticCenterTest.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      diagnosticCenter: true,
      test: true,
      slots: true,
    },
  });

  return { centerTests, totalCount };
};

export const getCenterTestById = async (id) => {
  const centerTest = await prisma.diagnosticCenterTest.findUnique({
    where: { id },
    include: {
      diagnosticCenter: true,
      test: true,
      slots: true,
    },
  });
  if (!centerTest) {
    throw new Error("Diagnostic Center Test mapping not found");
  }
  return centerTest;
};

export const deleteCenterTest = async (id) => {
  const centerTest = await prisma.diagnosticCenterTest.findUnique({ where: { id } });
  if (!centerTest) {
    throw new Error("Diagnostic Center Test mapping not found");
  }
  const deleted = await prisma.diagnosticCenterTest.delete({ where: { id } });

  try {
    await redis.del(`center:tests:${centerTest.diagnosticCenterId}`);
    await redis.del(`test:centers:${centerTest.testId}`);
  } catch (err) {
    console.warn("[Redis Cache Invalidation Warning]", err.message);
  }

  return deleted;
};
