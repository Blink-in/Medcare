import mongoose from "mongoose";

import User from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      isDeleted: { $ne: true },
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Unable to retrieve users. Please try again later.",
    });
  }
};

// GET SINGLE USER

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Unable to retrieve user. Please try again later.",
    });
  }
};

// UPDATE USER

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || firstName.trim().length < 2) {
        return res.status(400).json({
          message: "First name must be at least 2 characters long",
        });
      }

      user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || lastName.trim().length < 2) {
        return res.status(400).json({
          message: "Last name must be at least 2 characters long",
        });
      }

      user.lastName = lastName.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existingUser) {
        return res.status(409).json({
          message: "A user with this email already exists",
        });
      }

      user.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Unable to update user. Please try again later.",
    });
  }
};

// DELETE USER

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const currentUserId = req.user?._id || req.user?.id;

    if (currentUserId?.toString() === id) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.isActive = false;

    await user.save();

    return res.status(200).json({
      message: "User moved to trash successfully",
      user,
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Unable to delete user. Please try again later.",
    });
  }
};

// ACTIVATE / DEACTIVATE USER

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    return res.status(200).json({
      message: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);

    return res.status(500).json({
      message: "Unable to update user status. Please try again later.",
    });
  }
};

// UPDATE USER ROLE

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const allowedRoles = ["admin", "doctor", "patient"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Role must be admin, doctor, or patient.",
      });
    }

    const currentUserId = req.user?._id || req.user?.id;

    if (currentUserId?.toString() === id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      message: "Unable to update user role. Please try again later.",
    });
  }
};