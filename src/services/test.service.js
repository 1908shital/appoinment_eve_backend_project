import prisma from "../config/prisma.js";

export const createTest = async (name, description, disease) => {
  return await prisma.test.create({
    data: {
      name: name.trim(),
      description: description ? description.trim() : null,
      disease: disease ? disease.trim() : null,
    },
  });
};

export const getAllTests = async (skip = 0, limit = 10) => {
  const totalCount = await prisma.test.count();
  const tests = await prisma.test.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      centers: {
        include: {
          diagnosticCenter: true,
        },
      },
    },
  });

  return { tests, totalCount };
};

export const getTestById = async (id) => {
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      centers: {
        include: {
          diagnosticCenter: true,
          slots: true,
        },
      },
    },
  });
  if (!test) {
    throw new Error("Diagnostic Test not found");
  }
  return test;
};

export const updateTest = async (id, data) => {
  const test = await prisma.test.findUnique({ where: { id } });
  if (!test) {
    throw new Error("Diagnostic Test not found");
  }
  return await prisma.test.update({
    where: { id },
    data,
  });
};

export const deleteTest = async (id) => {
  const test = await prisma.test.findUnique({ where: { id } });
  if (!test) {
    throw new Error("Diagnostic Test not found");
  }
  return await prisma.test.delete({ where: { id } });
};
