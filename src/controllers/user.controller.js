import * as userService from "../services/user.service.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, ...extraData } = req.body;
    const user = await userService.signup(name, email, password, extraData);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    const isConflict = error.message.toLowerCase().includes("already exists");
    return res.status(isConflict ? 409 : 400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};