const express = require("express");
const slotController = require("../controllers/slot.controller");
const validate = require("../middleware/validation.middleware");
const { createSlotSchema, updateSlotStatusSchema } = require("../schemas/slot.schema");

const router = express.Router();

router.post("/", validate(createSlotSchema), slotController.createSlot);
router.get("/", slotController.getSlots);
router.get("/:id", slotController.getSlotById);
router.patch("/:id/status", validate(updateSlotStatusSchema), slotController.updateSlotStatus);

module.exports = router;
