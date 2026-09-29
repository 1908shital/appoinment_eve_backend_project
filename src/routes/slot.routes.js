import express from "express";
import * as slotController from "../controllers/slot.controller.js";
import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, validate(["diagnostic_center_test_id", "start_time", "end_time"]), slotController.createSlot);
router.post("/generate-7days", authMiddleware, slotController.generateNext7DaysSlots);
router.get("/", slotController.getSlots);
router.get("/center-test", slotController.getSlotsByCenterAndTest);
router.get("/center/:centerId/test/:testId", slotController.getSlotsByCenterAndTest);
router.get("/:id", slotController.getSlotById);
router.patch("/:id/status", authMiddleware, validate(["status"]), slotController.updateSlotStatus);

export default router;
