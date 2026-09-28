const centerTestService = require("../services/centerTest.service");

const createCenterTest = async (req, res) => {
  try {
    const { diagnostic_center_id, test_id, price } = req.body;
    const centerTest = await centerTestService.createCenterTest(
      diagnostic_center_id,
      test_id,
      price
    );
    return res.status(201).json({
      success: true,
      message: "Center test mapping created successfully",
      data: centerTest,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCenterTests = async (req, res) => {
  try {
    const centerTests = await centerTestService.getAllCenterTests();
    return res.status(200).json({
      success: true,
      data: centerTests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCenterTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const centerTest = await centerTestService.getCenterTestById(id);
    return res.status(200).json({
      success: true,
      data: centerTest,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const deleteCenterTest = async (req, res) => {
  try {
    const { id } = req.params;
    await centerTestService.deleteCenterTest(id);
    return res.status(200).json({
      success: true,
      message: "Center test mapping deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCenterTest,
  getAllCenterTests,
  getCenterTestById,
  deleteCenterTest,
};
