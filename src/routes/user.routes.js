const express = require("express");
const userController = require("../controllers/user.controller");
const validate = require("../middleware/validation.middleware");
const { signupSchema, loginSchema } = require("../schemas/user.schema");

const router = express.Router();

router.post("/signup", validate(signupSchema), userController.signup);
router.post("/login", validate(loginSchema), userController.login);
router.get("/:id", userController.getUserById);

module.exports = router;