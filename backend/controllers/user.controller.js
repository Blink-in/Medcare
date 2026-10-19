
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET ACTIVE USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

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

// GET USERS IN TRASH
export const getTrashedUsers = async (req, res) => {
  try {
    const users = await User.find({
      isDeleted: true,
    })
      .select("-password")
      .sort({ deletedAt: -1 });

    return res.status(200).json({
      message: "Trash users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get trashed users error:", error);
    return res.status(500).json({
      message: "Unable to retrieve Trash. Please try again later.",
    });
  }
};

// GET SINGLE USER
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
    const { firstName, lastName, email, phone } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      if (typeof email !== "string") {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "A user with this email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          message: "Phone must be a string",
        });
      }
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

// MOVE USER TO TRASH
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const currentUserId = req.user?._id || req.user?.id || req.user?.userId;

    if (currentUserId?.toString() === id) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.isActive = false;

    await user.save();

    return res.status(200).json({
      message: "User moved to Trash successfully",
      user,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      message: "Unable to move user to Trash. Please try again later.",
    });
  }
};

// RESTORE USER FROM TRASH
export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "Deleted user not found in Trash",
      });
    }

    user.isDeleted = false;
    user.deletedAt = null;

    // Keep the account inactive until an admin activates it.
    user.isActive = false;

    await user.save();

    return res.status(200).json({
      message: "User restored successfully. The account remains inactive.",
      user,
    });
  } catch (error) {
    console.error("Restore user error:", error);
    return res.status(500).json({
      message: "Unable to restore user. Please try again later.",
    });
  }
};

// PERMANENTLY DELETE USER
export const permanentlyDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "Deleted user not found in Trash",
      });
    }

    const [patientProfile, doctorProfile] = await Promise.all([
      Patient.findOne({ user: id }).select("_id"),
      Doctor.findOne({ user: id }).select("_id"),
    ]);

    if (patientProfile || doctorProfile) {
      return res.status(409).json({
        message:
          "This user still has a patient or doctor profile. Handle the related profile and records before permanently deleting this account.",
      });
    }

    await User.deleteOne({ _id: id, isDeleted: true });

    return res.status(200).json({
      message: "User permanently deleted successfully",
    });
  } catch (error) {
    console.error("Permanent user deletion error:", error);
    return res.status(500).json({
      message: "Unable to permanently delete this user. Please try again later.",
    });
  }
};

// ACTIVATE / DEACTIVATE USER
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const allowedRoles = ["admin", "doctor", "patient"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Role must be admin, doctor, or patient.",
      });
    }

    const currentUserId = req.user?._id || req.user?.id || req.user?.userId;

    if (currentUserId?.toString() === id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
