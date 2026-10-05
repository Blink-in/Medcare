import mongoose from "mongoose";
import User from "../models/userModel.js";


export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

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

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // First name validation
    if (firstName !== undefined) {
      if (firstName.trim().length < 2) {
        return res.status(400).json({
          message: "First name must be at least 2 characters long",
        });
      }

      user.firstName = firstName.trim();
    }

    // Last name validation
    if (lastName !== undefined) {
      if (lastName.trim().length < 2) {
        return res.status(400).json({
          message: "Last name must be at least 2 characters long",
        });
      }

      user.lastName = lastName.trim();
    }

    // Email validation
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
      });

      if (existingUser) {
        return res.status(409).json({
          message: "A user with this email already exists",
        });
      }

      user.email = email.toLowerCase().trim();
    }

    // Phone
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      message: "User deleted successfully",
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Toggle status
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
