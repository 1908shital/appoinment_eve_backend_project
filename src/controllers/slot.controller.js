import * as slotService from "../services/slot.service.js";

export const createSlot = async (req, res) => {
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
    const isConflict = error.message.toLowerCase().includes("already exists");
    return res.status(isConflict ? 409 : 400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getSlots = async (req, res) => {
  try {
    const { centerTestId, status, diagnostic_center_id, test_id } = req.query;

    if (diagnostic_center_id && test_id) {
      const result = await slotService.getSlotsByCenterAndTest(diagnostic_center_id, test_id);
      return res.status(200).json({
        success: true,
        message: `Slots fetched successfully (${result.source})`,
        data: result.data,
      });
    }

    const slots = await slotService.getSlots({ centerTestId, status });
    return res.status(200).json({
      success: true,
      message: "Availability slots retrieved successfully",
      data: slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getSlotsByCenterAndTest = async (req, res) => {
  try {
    const { centerId, testId } = req.params;
    const diagnosticCenterId = centerId || req.query.diagnostic_center_id || req.query.centerId;
    const targetTestId = testId || req.query.test_id || req.query.testId;

    if (!diagnosticCenterId || !targetTestId) {
      return res.status(400).json({
        success: false,
        message: "Both diagnostic_center_id and test_id are required",
        data: null,
      });
    }

    const result = await slotService.getSlotsByCenterAndTest(diagnosticCenterId, targetTestId);
    return res.status(200).json({
      success: true,
      message: `Slots fetched successfully (${result.source})`,
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

export const getSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await slotService.getSlotById(id);
    return res.status(200).json({
      success: true,
      message: "Slot details retrieved successfully",
      data: slot,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateSlotStatus = async (req, res) => {
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
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const generateNext7DaysSlots = async (req, res) => {
  try {
    const createdCount = await slotService.generateSlotsForNext7Days();
    return res.status(200).json({
      success: true,
      message: `Generated 1-hour availability slots for the next 7 days (${createdCount} new slots created)`,
      data: { createdCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

