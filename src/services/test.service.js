const { Test } = require("../models");

const createTest = async (name, description, disease) => {
  return await Test.create({
    data: {
      name: name.trim(),
      description: description ? description.trim() : null,
      disease: disease ? disease.trim() : null,
    },
  });
};

const getAllTests = async () => {
  return await Test.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      centers: {
        include: {
          diagnosticCenter: true,
        },
      },
    },
  });
};

const getTestById = async (id) => {
  const test = await Test.findUnique({
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

const updateTest = async (id, data) => {
  const test = await Test.findUnique({ where: { id } });
  if (!test) {
    throw new Error("Diagnostic Test not found");
  }
  return await Test.update({
    where: { id },
    data,
  });
};

const deleteTest = async (id) => {
  const test = await Test.findUnique({ where: { id } });
  if (!test) {
    throw new Error("Diagnostic Test not found");
  }
  return await Test.delete({ where: { id } });
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
};
