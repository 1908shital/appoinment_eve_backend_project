const express = require("express");
const testController = require("../controllers/test.controller");
const validate = require("../middleware/validation.middleware");
const { createTestSchema, updateTestSchema } = require("../schemas/test.schema");

const router = express.Router();

router.post("/", validate(createTestSchema), testController.createTest);
router.get("/", testController.getAllTests);
router.get("/:id", testController.getTestById);
router.put("/:id", validate(updateTestSchema), testController.updateTest);
router.delete("/:id", testController.deleteTest);

module.exports = router;
