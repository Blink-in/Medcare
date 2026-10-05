import User from "../models/userModel.js";
import { hashPassword } from "../utils/hashPassword.js";

// CREATE STAFF USER
export const createStaffUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    } = req.body;

    // Required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        message:
          "First name, last name, email, password, and role are required",
      });
    }

    // Validate role
    if (!["doctor", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either doctor or admin",
      });
    }

    // Validate names
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string"
    ) {
      return res.status(400).json({
        message: "First name and last name must be strings",
      });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (trimmedFirstName.length < 2) {
      return res.status(400).json({
        message: "First name must be at least 2 characters",
      });
    }

    if (trimmedLastName.length < 2) {
      return res.status(400).json({
        message: "Last name must be at least 2 characters",
      });
    }

    // Validate email
    if (typeof email !== "string") {
      return res.status(400).json({
        message: "Email must be a string",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Validate password
    if (typeof password !== "string") {
      return res.status(400).json({
        message: "Password must be a string",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create staff user
    const user = await User.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role,
      isActive: true,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: `${role === "doctor" ? "Doctor" : "Admin"} account created successfully`,
      user: userResponse,
    });
  } catch (error) {
    console.error("Create staff user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create staff user",
    });
  }
};