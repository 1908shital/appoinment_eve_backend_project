import * as testService from "../services/test.service.js";
import * as diagnosticCenterService from "../services/diagnosticCenter.service.js";

export const createTest = async (req, res) => {
  try {
    const { name, description, disease } = req.body;
    const test = await testService.createTest(name, description, disease);
    return res.status(201).json({
      success: true,
      message: "Diagnostic Test created successfully",
      data: test,
    });
  } catch (error) {
    const isConflict = error.message.toLowerCase().includes("already exists");
    return res.status(isConflict ? 409 : 400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getAllTests = async (req, res) => {
  try {
    const tests = await testService.getAllTests();
    return res.status(200).json({
      success: true,
      message: "Diagnostic tests retrieved successfully",
      data: tests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await testService.getTestById(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic test details retrieved successfully",
      data: test,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getCentersByTestId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await diagnosticCenterService.getCentersByTestId(id);
    return res.status(200).json({
      success: true,
      message: `Diagnostic centers offering test fetched successfully (${result.source})`,
      data: result.data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await testService.updateTest(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Test updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    await testService.deleteTest(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Test deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
