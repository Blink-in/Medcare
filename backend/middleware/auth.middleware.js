import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from authentication cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User associated with this token no longer exists",
      });
    }

    // Check if account is still active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    // Attach authenticated user information to request
    req.user = {
      userId: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    // Expired JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(500).json({
      message: "Authentication failed. Please try again later.",
    });
  }
};