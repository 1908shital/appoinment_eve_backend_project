const slotService = require("../services/slot.service");

const createSlot = async (req, res) => {
  try {
    const { diagnostic_center_test_id, start_time, end_time } = req.body;
    const slot = await slotService.createSlot(
      diagnostic_center_test_id,
      start_time,
      end_time
    );
    return res.status(201).json({
      success: true,
      message: "Availability slot created successfully",
      data: slot,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getSlots = async (req, res) => {
  try {
    const { centerTestId, status } = req.query;
    const slots = await slotService.getSlots({ centerTestId, status });
    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await slotService.getSlotById(id);
    return res.status(200).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const updateSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedSlot = await slotService.updateSlotStatus(id, status);
    return res.status(200).json({
      success: true,
      message: "Slot status updated successfully",
      data: updatedSlot,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSlot,
  getSlots,
  getSlotById,
  updateSlotStatus,
};
