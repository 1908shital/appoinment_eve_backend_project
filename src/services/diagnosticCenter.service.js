import prisma from "../config/prisma.js";
import redis from "../config/redis.js";

export const createCenter = async (name, location) => {
  return await prisma.diagnosticCenter.create({
    data: { name: name.trim(), location: location.trim() },
  });
};

export const getAllCenters = async (skip = 0, limit = 10) => {
  const totalCount = await prisma.diagnosticCenter.count();
  const centers = await prisma.diagnosticCenter.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      tests: {
        include: {
          test: true,
        },
      },
    },
  });

  return { centers, totalCount };
};

export const getCenterById = async (id) => {
  const center = await prisma.diagnosticCenter.findUnique({
    where: { id },
    include: {
      tests: {
        include: {
          test: true,
          slots: true,
        },
      },
    },
  });
  if (!center) {
    throw new Error("Diagnostic Center not found");
  }
  return center;
};

export const getCenterTestsByCenterId = async (centerId) => {
  const cacheKey = `center:tests:${centerId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { source: "redis", data: parsed };
      }
    }
  } catch (err) {
    console.warn("[Redis Read Warning]", err.message);
  }

  const centerExists = await prisma.diagnosticCenter.findUnique({ where: { id: centerId } });
  if (!centerExists) {
    throw new Error("Diagnostic Center not found");
  }

  const centerTests = await prisma.diagnosticCenterTest.findMany({
    where: { diagnosticCenterId: centerId },
    include: {
      test: true,
      slots: true,
    },
  });

  try {
    const ttl = centerTests.length > 0 ? 600 : 5;
    await redis.set(cacheKey, JSON.stringify(centerTests), "EX", ttl);
  } catch (err) {
    console.warn("[Redis Write Warning]", err.message);
  }

  return { source: "database", data: centerTests };
};

export const getCentersByTestId = async (testId) => {
  const cacheKey = `test:centers:${testId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { source: "redis", data: parsed };
      }
    }
  } catch (err) {
    console.warn("[Redis Read Warning]", err.message);
  }

  const centerTests = await prisma.diagnosticCenterTest.findMany({
    where: { testId },
    include: {
      diagnosticCenter: true,
      slots: {
        where: { status: "open" },
      },
    },
  });

  try {
    const ttl = centerTests.length > 0 ? 600 : 5;
    await redis.set(cacheKey, JSON.stringify(centerTests), "EX", ttl);
  } catch (err) {
    console.warn("[Redis Write Warning]", err.message);
  }

  return { source: "database", data: centerTests };
};

export const updateCenter = async (id, data) => {
  const center = await prisma.diagnosticCenter.findUnique({ where: { id } });
  if (!center) {
    throw new Error("Diagnostic Center not found");
  }
  return await prisma.diagnosticCenter.update({
    where: { id },
    data,
  });
};

export const deleteCenter = async (id) => {
  const center = await prisma.diagnosticCenter.findUnique({ where: { id } });
  if (!center) {
    throw new Error("Diagnostic Center not found");
  }
  return await prisma.diagnosticCenter.delete({ where: { id } });
};
