const express = require("express");
const centerTestController = require("../controllers/centerTest.controller");
const validate = require("../middleware/validation.middleware");
const { createCenterTestSchema } = require("../schemas/centerTest.schema");

const router = express.Router();

router.post("/", validate(createCenterTestSchema), centerTestController.createCenterTest);
router.get("/", centerTestController.getAllCenterTests);
router.get("/:id", centerTestController.getCenterTestById);
router.delete("/:id", centerTestController.deleteCenterTest);

module.exports = router;
