import * as diagnosticCenterService from "../services/diagnosticCenter.service.js";

export const createCenter = async (req, res) => {
  try {
    const { name, location } = req.body;
    const center = await diagnosticCenterService.createCenter(name, location);
    return res.status(201).json({
      success: true,
      message: "Diagnostic Center created successfully",
      data: center,
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

export const getAllCenters = async (req, res) => {
  try {
    const centers = await diagnosticCenterService.getAllCenters();
    return res.status(200).json({
      success: true,
      message: "Diagnostic centers retrieved successfully",
      data: centers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await diagnosticCenterService.getCenterById(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic center details retrieved successfully",
      data: center,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getCenterTestsByCenterId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await diagnosticCenterService.getCenterTestsByCenterId(id);
    return res.status(200).json({
      success: true,
      message: `Diagnostic center tests fetched successfully (${result.source})`,
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

export const updateCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await diagnosticCenterService.updateCenter(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Center updated successfully",
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

export const deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await diagnosticCenterService.deleteCenter(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Center deleted successfully",
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
