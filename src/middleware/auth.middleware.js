import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "DiagBooking@2026#SecretKey";

/**
 * Authentication Middleware: Verifies JWT token from Authorization Bearer header.
 * Attaches decoded user payload (req.user) to request object.
 */

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token missing in Authorization header.",
        data: null,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token (1-day expiration)",
      data: null,
    });
  }
};

export default authMiddleware;
