const diagnosticCenterService = require("../services/diagnosticCenter.service");

const createCenter = async (req, res) => {
  try {
    const { name, location } = req.body;
    const center = await diagnosticCenterService.createCenter(name, location);
    return res.status(201).json({
      success: true,
      message: "Diagnostic Center created successfully",
      data: center,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCenters = async (req, res) => {
  try {
    const centers = await diagnosticCenterService.getAllCenters();
    return res.status(200).json({
      success: true,
      data: centers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await diagnosticCenterService.getCenterById(id);
    return res.status(200).json({
      success: true,
      data: center,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const updateCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await diagnosticCenterService.updateCenter(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Center updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await diagnosticCenterService.deleteCenter(id);
    return res.status(200).json({
      success: true,
      message: "Diagnostic Center deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter,
};
