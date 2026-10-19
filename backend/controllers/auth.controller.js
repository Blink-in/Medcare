import User from "../models/userModel.js";
import Patient from "../models/patientModel.js";
import crypto from "node:crypto";
import sendPasswordResetEmail from "../utils/sendPasswordResetEmail.js";

import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";

import {
  setAuthCookie,
  clearAuthCookie,
} from "../utils/authCookie.js";

// Sign up
export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodType,
      address,
      allergies,
      emergencyContact,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message:
          "First name, last name, email and password are required",
      });
    }

    if (typeof firstName !== "string" || firstName.trim().length < 2) {
      return res.status(400).json({
        message: "First name must be at least 2 characters long",
      });
    }

    if (typeof lastName !== "string" || lastName.trim().length < 2) {
      return res.status(400).json({
        message: "Last name must be at least 2 characters long",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      typeof email !== "string" ||
      !emailRegex.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (phone && typeof phone !== "string") {
      return res.status(400).json({
        message: "Phone number must be a valid text value",
      });
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Please provide a valid gender",
      });
    }

    if (
      bloodType &&
      ![
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "unknown",
      ].includes(bloodType)
    ) {
      return res.status(400).json({
        message: "Please provide a valid blood type",
      });
    }

    if (allergies && !Array.isArray(allergies)) {
      return res.status(400).json({
        message: "Allergies must be provided as a list",
      });
    }

    if (emergencyContact && typeof emergencyContact !== "object") {
      return res.status(400).json({
        message: "Emergency contact must be an object",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || "",
      role: "patient",
      isActive: true,
      isDeleted: false,
      deletedAt: null,
    });

    try {
      const patient = await Patient.create({
        user: user._id,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodType: bloodType || "unknown",
        address: address?.trim() || "",
        allergies: Array.isArray(allergies)
          ? allergies
              .filter((allergy) => typeof allergy === "string")
              .map((allergy) => allergy.trim())
              .filter(Boolean)
          : [],
        emergencyContact: emergencyContact || {},
        primaryDoctor: null,
        medicalHistory: "",
        isDeleted: false,
        deletedAt: null,
      });

      const token = generateToken(user);

      setAuthCookie(res, token);

      const userResponse = user.toObject();

      delete userResponse.password;

      return res.status(201).json({
        message: "Account created successfully",
        token,
        user: userResponse,
        patient,
      });
    } catch (patientError) {
      await User.findByIdAndDelete(user._id);

      throw patientError;
    }
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return res.status(400).json({
        message: firstError?.message || "Invalid signup details",
      });
    }

    return res.status(500).json({
      message: "Unable to create account. Please try again later.",
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      typeof email !== "string" ||
      !emailRegex.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isDeleted === true) {
      return res.status(403).json({
        message: "This account has been moved to Trash",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    const isPasswordCorrect = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    setAuthCookie(res, token);

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

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isDeleted === true) {
      return res.status(403).json({
        message: "This account has been moved to Trash",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    return res.status(200).json({
      message: "Current user retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message:
        "Unable to retrieve current user. Please try again later.",
    });
  }
};

// Logout
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

const genericResetMessage =
  "If an active account exists for that email, a password reset link will be sent shortly.";

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173").replace(/\/+$/, "");

// Request a password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Please provide your email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
      isDeleted: { $ne: true },
      isActive: true,
    });

    if (!user) {
      return res.status(200).json({
        message: genericResetMessage,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl =
      `${getFrontendUrl()}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error("Password reset email delivery failed:", emailError);

      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
    }

    return res.status(200).json({
      message: genericResetMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to process your request. Please try again later.",
    });
  }
};

// Reset a password using a valid token
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (
      typeof confirmPassword !== "string" ||
      password !== confirmPassword
    ) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isDeleted: { $ne: true },
      isActive: true,
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired",
      });
    }

   user.password = await hashPassword(password);
user.passwordResetToken = null;
user.passwordResetExpires = null;
user.tokenVersion = (user.tokenVersion ?? 0) + 1;

await user.save();

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset your password. Please try again later.",
    });
  }
};
