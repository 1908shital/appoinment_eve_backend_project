import * as centerTestService from "../services/centerTest.service.js";

export const createCenterTest = async (req, res) => {
  try {
    const { diagnostic_center_id, test_id, price } = req.body;
    const centerTest = await centerTestService.createCenterTest(
      diagnostic_center_id,
      test_id,
      price
    );
    return res.status(201).json({
      success: true,
      message: "Test mapped to diagnostic center successfully",
      data: centerTest,
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

export const getAllCenterTests = async (req, res) => {
  try {
    const centerTests = await centerTestService.getAllCenterTests();
    return res.status(200).json({
      success: true,
      message: "Diagnostic center test mappings retrieved successfully",
      data: centerTests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getCenterTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const centerTest = await centerTestService.getCenterTestById(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic center test mapping details retrieved successfully",
      data: centerTest,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteCenterTest = async (req, res) => {
  try {
    const { id } = req.params;
    await centerTestService.deleteCenterTest(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Center Test mapping deleted successfully",
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
