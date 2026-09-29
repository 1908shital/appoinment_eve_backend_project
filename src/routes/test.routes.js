import express from "express";
import * as testController from "../controllers/test.controller.js";
import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, validate(["name"]), testController.createTest);
router.get("/", testController.getAllTests);
router.get("/:id", testController.getTestById);
router.get("/:id/centers", testController.getCentersByTestId);
router.put("/:id", authMiddleware, testController.updateTest);
router.delete("/:id", authMiddleware, testController.deleteTest);

export default router;
