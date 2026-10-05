import User from "../models/userModel.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";

import { generateToken } from "../utils/generateToken.js";
import {
  setAuthCookie,
  clearAuthCookie,
} from "../utils/authCookie.js";


//sign up

export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
    } = req.body;

    // Required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message:
          "First name, last name, email and password are required",
      });
    }

    // First name validation
    if (firstName.trim().length < 2) {
      return res.status(400).json({
        message: "First name must be at least 2 characters long",
      });
    }

    // Last name validation
    if (lastName.trim().length < 2) {
      return res.status(400).json({
        message: "Last name must be at least 2 characters long",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    // Public signup ALWAYS creates a patient
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      role: "patient",
    });

    // Generate JWT
    const token = generateToken(user);
    setAuthCookie(res, token);

    // Convert Mongoose document to normal object
    const userResponse = user.toObject();

    // Never send password to frontend
    delete userResponse.password;

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error("Signup error:", error);

    // Duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Unable to create account. Please try again later.",
    });
  }
};


// LOGIN

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Find user
    // password has select: false in the User model,
    // so we explicitly include it for login.

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // Do not reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user);
    setAuthCookie(res, token);

    // Remove password before sending user data
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login. Please try again later.",
    });
  }
};



// GET CURRENT USER

export const getMe = async (req, res) => {
  try {
    // auth.middleware.js will eventually put the
    // authenticated user's information inside req.user.

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Current user retrieved successfully",
      user,
    });

  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Unable to retrieve current user. Please try again later.",
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Logout failed. Please try again later.",
    });
  }
};



