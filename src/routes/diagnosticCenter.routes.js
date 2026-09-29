import express from "express";
import * as diagnosticCenterController from "../controllers/diagnosticCenter.controller.js";
import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, validate(["name", "location"]), diagnosticCenterController.createCenter);
router.get("/", diagnosticCenterController.getAllCenters);
router.get("/:id", diagnosticCenterController.getCenterById);
router.get("/:id/tests", diagnosticCenterController.getCenterTestsByCenterId);
router.put("/:id", authMiddleware, diagnosticCenterController.updateCenter);
router.delete("/:id", authMiddleware, diagnosticCenterController.deleteCenter);

export default router;
