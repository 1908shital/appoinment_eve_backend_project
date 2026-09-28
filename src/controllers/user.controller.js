const userService = require("../services/user.service");

// Signup controller
const signup = async (req, res) => {
  try {
    const { name, email, password, phone_number, address, age, gender, relationship_status } = req.body;

    const user = await userService.signup(name, email, password, {
      phone_number,
      address,
      age,
      gender,
      relationship_status,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong during signup",
    });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};

module.exports = {
  signup,
  login,
  getUserById,
};