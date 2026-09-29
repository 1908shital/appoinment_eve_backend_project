import express from "express";
import * as centerTestController from "../controllers/centerTest.controller.js";
import validate from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/", validate(["diagnostic_center_id", "test_id", "price"]), centerTestController.createCenterTest);
router.get("/", centerTestController.getAllCenterTests);
router.get("/:id", centerTestController.getCenterTestById);
router.delete("/:id", centerTestController.deleteCenterTest);

export default router;
