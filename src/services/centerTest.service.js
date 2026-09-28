const { DiagnosticCenterTest } = require("../models");

const createCenterTest = async (diagnosticCenterId, testId, price) => {
  const existing = await DiagnosticCenterTest.findUnique({
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

  return await DiagnosticCenterTest.create({
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
};

const getAllCenterTests = async () => {
  return await DiagnosticCenterTest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      diagnosticCenter: true,
      test: true,
      slots: true,
    },
  });
};

const getCenterTestById = async (id) => {
  const centerTest = await DiagnosticCenterTest.findUnique({
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

const deleteCenterTest = async (id) => {
  const centerTest = await DiagnosticCenterTest.findUnique({ where: { id } });
  if (!centerTest) {
    throw new Error("Diagnostic Center Test mapping not found");
  }
  return await DiagnosticCenterTest.delete({ where: { id } });
};

module.exports = {
  createCenterTest,
  getAllCenterTests,
  getCenterTestById,
  deleteCenterTest,
};
