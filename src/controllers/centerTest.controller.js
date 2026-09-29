import * as centerTestService from "../services/centerTest.service.js";
import { getPaginationParams, formatPaginatedResponse } from "../utils/pagination.util.js";

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
    const { page, limit, skip } = getPaginationParams(req.query);
    const { centerTests, totalCount } = await centerTestService.getAllCenterTests(skip, limit);
    const paginated = formatPaginatedResponse(centerTests, totalCount, page, limit);

    return res.status(200).json({
      success: true,
      message: "Diagnostic center test mappings retrieved successfully",
      data: paginated.data,
      pagination: paginated.pagination,
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
