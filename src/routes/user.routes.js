import express from "express";
import * as userController from "../controllers/user.controller.js";
import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", validate(["name", "email", "password"]), userController.signup);
router.post("/login", validate(["email", "password"]), userController.login);
router.get("/:id", authMiddleware, userController.getUserById);

export default router;