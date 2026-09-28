const testService = require("../services/test.service");

const createTest = async (req, res) => {
  try {
    const { name, description, disease } = req.body;
    const test = await testService.createTest(name, description, disease);
    return res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: test,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllTests = async (req, res) => {
  try {
    const tests = await testService.getAllTests();
    return res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await testService.getTestById(id);
    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await testService.updateTest(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Test updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    await testService.deleteTest(id);
    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
};
