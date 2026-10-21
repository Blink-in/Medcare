import mongoose from "mongoose";
import Department from "../models/departmentModel.js";
import Doctor from "../models/doctorModel.js";


// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
  try {
    const { name, description, location } = req.body;

    // Required field
    if (!name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    // Check if department already exists
    const existingDepartment = await Department.findOne({
      name: name.trim(),
    });

    if (existingDepartment) {
      return res.status(409).json({
        message: "A department with this name already exists",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description,
      location,
    });

    return res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A department with this name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create department",
    });
  }
};


// GET ALL DEPARTMENTS
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("headDoctor", "user licenseNumber specialization")
      .sort({ name: 1 });

    return res.status(200).json({
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      message: "Failed to retrieve departments",
    });
  }
};


// GET SINGLE DEPARTMENT
export const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }

    const department = await Department.findById(id).populate(
      "headDoctor",
      "user licenseNumber specialization"
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    return res.status(200).json({
      department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    return res.status(500).json({
      message: "Failed to retrieve department",
    });
  }
};


// UPDATE DEPARTMENT
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Update only allowed fields
    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Department name cannot be empty",
        });
      }

      // Check if another department already uses this name
      const duplicateDepartment = await Department.findOne({
        name: trimmedName,
        _id: { $ne: id },
      });

      if (duplicateDepartment) {
        return res.status(409).json({
          message: "A department with this name already exists",
        });
      }

      department.name = trimmedName;
    }

    if (description !== undefined) {
      department.description = description;
    }

    if (location !== undefined) {
      department.location = location;
    }

    await department.save();

    return res.status(200).json({
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A department with this name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update department",
    });
  }
};


// DELETE DEPARTMENT
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Don't allow deletion while a head doctor is assigned
    if (department.headDoctor) {
      return res.status(400).json({
        message: "Cannot delete a department with an assigned head doctor",
      });
    }

    await Department.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);

    return res.status(500).json({
      message: "Failed to delete department",
    });
  }
};


// TOGGLE DEPARTMENT STATUS
export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    department.isActive = !department.isActive;

    await department.save();

    return res.status(200).json({
      message: `Department ${
        department.isActive ? "activated" : "deactivated"
      } successfully`,
      department,
    });
  } catch (error) {
    console.error("Toggle department status error:", error);

    return res.status(500).json({
      message: "Failed to update department status",
    });
  }
};

// GET PUBLIC DEPARTMENT DIRECTORY
export const getPublicDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      isActive: true,
      isDeleted: { $ne: true },
    })
      .select("name description location")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("Get public departments error:", error);
    return res.status(500).json({
      message: "Failed to retrieve public departments",
    });
  }
};
