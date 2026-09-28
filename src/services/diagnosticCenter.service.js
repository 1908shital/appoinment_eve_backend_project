const { DiagnosticCenter } = require("../models");

const createCenter = async (name, location) => {
  return await DiagnosticCenter.create({
    data: { name: name.trim(), location: location.trim() },
  });
};

const getAllCenters = async () => {
  return await DiagnosticCenter.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tests: {
        include: {
          test: true,
        },
      },
    },
  });
};

const getCenterById = async (id) => {
  const center = await DiagnosticCenter.findUnique({
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

const updateCenter = async (id, data) => {
  const center = await DiagnosticCenter.findUnique({ where: { id } });
  if (!center) {
    throw new Error("Diagnostic Center not found");
  }
  return await DiagnosticCenter.update({
    where: { id },
    data,
  });
};

const deleteCenter = async (id) => {
  const center = await DiagnosticCenter.findUnique({ where: { id } });
  if (!center) {
    throw new Error("Diagnostic Center not found");
  }
  return await DiagnosticCenter.delete({ where: { id } });
};

module.exports = {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter,
};
