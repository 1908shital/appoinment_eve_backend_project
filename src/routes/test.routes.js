import express from "express";
import * as testController from "../controllers/test.controller.js";
import validate from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/", validate(["name"]), testController.createTest);
router.get("/", testController.getAllTests);
router.get("/:id", testController.getTestById);
router.get("/:id/centers", testController.getCentersByTestId);
router.put("/:id", testController.updateTest);
router.delete("/:id", testController.deleteTest);

export default router;
