const express = require("express");
const diagnosticCenterController = require("../controllers/diagnosticCenter.controller");
const validate = require("../middleware/validation.middleware");
const { createCenterSchema, updateCenterSchema } = require("../schemas/diagnosticCenter.schema");

const router = express.Router();

router.post("/", validate(createCenterSchema), diagnosticCenterController.createCenter);
router.get("/", diagnosticCenterController.getAllCenters);
router.get("/:id", diagnosticCenterController.getCenterById);
router.put("/:id", validate(updateCenterSchema), diagnosticCenterController.updateCenter);
router.delete("/:id", diagnosticCenterController.deleteCenter);

module.exports = router;
