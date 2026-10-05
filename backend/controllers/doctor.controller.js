
import mongoose from "mongoose";

import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import Department from "../models/departmentModel.js";

// CREATE DOCTOR
export const createDoctor = async (req, res) => {
  try {
    const {
      user,
      licenseNumber,
      specialization,
      qualification,
      experience,
      bio,
      consultationFee,
      department,
      availability,
    } = req.body;

    // Required fields
    if (
      !user ||
      !licenseNumber ||
      !specialization ||
      !qualification ||
      !department
    ) {
      return res.status(400).json({
        message:
          "User, license number, specialization, qualification, and department are required",
      });
    }

    // Validate User ID
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Validate Department ID
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }

    // Validate text fields
    if (
      typeof licenseNumber !== "string" ||
      typeof specialization !== "string"
    ) {
      return res.status(400).json({
        message: "License number and specialization must be strings",
      });
    }

    const trimmedLicenseNumber = licenseNumber.trim();
    const trimmedSpecialization = specialization.trim();

    if (!trimmedLicenseNumber || !trimmedSpecialization) {
      return res.status(400).json({
        message: "License number and specialization cannot be empty",
      });
    }

    // Validate qualifications
    if (!Array.isArray(qualification) || qualification.length === 0) {
      return res.status(400).json({
        message: "At least one qualification is required",
      });
    }

    // Validate qualification values
    if (
      qualification.some(
        (item) => typeof item !== "string" || !item.trim()
      )
    ) {
      return res.status(400).json({
        message: "All qualifications must be non-empty strings",
      });
    }

    // Find user
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // User must have doctor role
    if (existingUser.role !== "doctor") {
      return res.status(400).json({
        message: "Selected user does not have a doctor role",
      });
    }

    // User must be active
    if (!existingUser.isActive) {
      return res.status(400).json({
        message: "Cannot create a doctor profile for an inactive user",
      });
    }

    // Check if user already has a doctor profile
    const existingDoctor = await Doctor.findOne({ user });

    if (existingDoctor) {
      return res.status(409).json({
        message: "This user already has a doctor profile",
      });
    }

    // Find department
    const existingDepartment = await Department.findById(department);

    if (!existingDepartment) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Department must be active
    if (!existingDepartment.isActive) {
      return res.status(400).json({
        message: "Cannot assign doctor to an inactive department",
      });
    }

    // Check license number
    const existingLicense = await Doctor.findOne({
      licenseNumber: trimmedLicenseNumber,
    });

    if (existingLicense) {
      return res.status(409).json({
        message: "A doctor with this license number already exists",
      });
    }

    // Create doctor
    const doctor = await Doctor.create({
      user,
      licenseNumber: trimmedLicenseNumber,
      specialization: trimmedSpecialization,
      qualification: qualification.map((item) => item.trim()),
      experience,
      bio,
      consultationFee,
      department,
      availability,
    });

    // Populate related data
    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "firstName lastName email phone role avatar")
      .populate("department", "name description location");

    return res.status(201).json({
      message: "Doctor created successfully",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Doctor with this information already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create doctor",
    });
  }
};

// GET ALL DOCTORS
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "firstName lastName email phone role avatar")
      .populate("department", "name description location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      message: "Failed to retrieve doctors",
    });
  }
};

// GET SINGLE DOCTOR
export const getDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id)
      .populate("user", "firstName lastName email phone role avatar")
      .populate("department", "name description location");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    return res.status(500).json({
      message: "Failed to retrieve doctor",
    });
  }
};

// GET MY DOCTOR PROFILE
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.userId,
    })
      .populate("user", "firstName lastName email phone role avatar")
      .populate("department", "name description location");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      doctor,
    });
  } catch (error) {
    console.error("Get my doctor profile error:", error);

    return res.status(500).json({
      message: "Failed to retrieve doctor profile",
    });
  }
};

// UPDATE DOCTOR
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      licenseNumber,
      specialization,
      qualification,
      experience,
      bio,
      consultationFee,
      department,
      availability,
    } = req.body;

    // Validate Doctor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Update license number
    if (licenseNumber !== undefined) {
      if (typeof licenseNumber !== "string") {
        return res.status(400).json({
          message: "License number must be a string",
        });
      }

      const trimmedLicense = licenseNumber.trim();

      if (!trimmedLicense) {
        return res.status(400).json({
          message: "License number cannot be empty",
        });
      }

      const duplicateLicense = await Doctor.findOne({
        licenseNumber: trimmedLicense,
        _id: { $ne: id },
      });

      if (duplicateLicense) {
        return res.status(409).json({
          message: "A doctor with this license number already exists",
        });
      }

      doctor.licenseNumber = trimmedLicense;
    }

    // Update specialization
    if (specialization !== undefined) {
      if (typeof specialization !== "string") {
        return res.status(400).json({
          message: "Specialization must be a string",
        });
      }

      const trimmedSpecialization = specialization.trim();

      if (!trimmedSpecialization) {
        return res.status(400).json({
          message: "Specialization cannot be empty",
        });
      }

      doctor.specialization = trimmedSpecialization;
    }

    // Update qualifications
    if (qualification !== undefined) {
      if (!Array.isArray(qualification) || qualification.length === 0) {
        return res.status(400).json({
          message: "At least one qualification is required",
        });
      }

      if (
        qualification.some(
          (item) => typeof item !== "string" || !item.trim()
        )
      ) {
        return res.status(400).json({
          message: "All qualifications must be non-empty strings",
        });
      }

      doctor.qualification = qualification.map((item) => item.trim());
    }

    // Update experience
    if (experience !== undefined) {
      if (
        typeof experience !== "number" ||
        !Number.isFinite(experience)
      ) {
        return res.status(400).json({
          message: "Experience must be a valid number",
        });
      }

      if (experience < 0 || experience > 70) {
        return res.status(400).json({
          message: "Experience must be between 0 and 70 years",
        });
      }

      doctor.experience = experience;
    }

    // Update bio
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          message: "Bio must be a string",
        });
      }

      doctor.bio = bio.trim();
    }

    // Update consultation fee
    if (consultationFee !== undefined) {
      if (
        typeof consultationFee !== "number" ||
        !Number.isFinite(consultationFee)
      ) {
        return res.status(400).json({
          message: "Consultation fee must be a valid number",
        });
      }

      if (consultationFee < 0) {
        return res.status(400).json({
          message: "Consultation fee cannot be negative",
        });
      }

      doctor.consultationFee = consultationFee;
    }

    // Update department
    if (department !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({
          message: "Invalid department ID",
        });
      }

      const existingDepartment = await Department.findById(department);

      if (!existingDepartment) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      if (!existingDepartment.isActive) {
        return res.status(400).json({
          message: "Cannot assign doctor to an inactive department",
        });
      }

      doctor.department = department;
    }

    // Update availability
    if (availability !== undefined) {
      if (!Array.isArray(availability)) {
        return res.status(400).json({
          message: "Availability must be an array",
        });
      }

      doctor.availability = availability;
    }

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "firstName lastName email phone role avatar")
      .populate("department", "name description location");

    return res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Doctor with this information already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update doctor",
    });
  }
};

// UPDATE MY DOCTOR PROFILE
export const updateMyDoctorProfile = async (req, res) => {
  try {
    const {
      specialization,
      qualification,
      experience,
      bio,
      consultationFee,
      availability,
    } = req.body;

    const doctor = await Doctor.findOne({
      user: req.user.userId,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    // Update specialization
    if (specialization !== undefined) {
      if (typeof specialization !== "string") {
        return res.status(400).json({
          message: "Specialization must be a string",
        });
      }

      const trimmedSpecialization = specialization.trim();

      if (!trimmedSpecialization) {
        return res.status(400).json({
          message: "Specialization cannot be empty",
        });
      }

      doctor.specialization = trimmedSpecialization;
    }

    // Update qualifications
    if (qualification !== undefined) {
      if (!Array.isArray(qualification) || qualification.length === 0) {
        return res.status(400).json({
          message: "At least one qualification is required",
        });
      }

      if (
        qualification.some(
          (item) => typeof item !== "string" || !item.trim()
        )
      ) {
        return res.status(400).json({
          message: "All qualifications must be non-empty strings",
        });
      }

      doctor.qualification = qualification.map((item) => item.trim());
    }

    // Update experience
    if (experience !== undefined) {
      if (
        typeof experience !== "number" ||
        !Number.isFinite(experience)
      ) {
        return res.status(400).json({
          message: "Experience must be a valid number",
        });
      }

      if (experience < 0 || experience > 70) {
        return res.status(400).json({
          message: "Experience must be between 0 and 70 years",
        });
      }

      doctor.experience = experience;
    }

    // Update bio
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          message: "Bio must be a string",
        });
      }

      doctor.bio = bio.trim();
    }

    // Update consultation fee
    if (consultationFee !== undefined) {
      if (
        typeof consultationFee !== "number" ||
        !Number.isFinite(consultationFee)
      ) {
        return res.status(400).json({
          message: "Consultation fee must be a valid number",
        });
      }

      if (consultationFee < 0) {
        return res.status(400).json({
          message: "Consultation fee cannot be negative",
        });
      }

      doctor.consultationFee = consultationFee;
    }

    // Update availability
    if (availability !== undefined) {
      if (!Array.isArray(availability)) {
        return res.status(400).json({
          message: "Availability must be an array",
        });
      }

      doctor.availability = availability;
    }

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "firstName lastName email phone role avatar")
      .populate("department", "name description location");

    return res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update my doctor profile error:", error);

    return res.status(500).json({
      message: "Failed to update doctor profile",
    });
  }
};

// TOGGLE DOCTOR STATUS
export const toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    doctor.isActive = !doctor.isActive;

    await doctor.save();

    return res.status(200).json({
      message: `Doctor ${
        doctor.isActive ? "activated" : "deactivated"
      } successfully`,
      doctor,
    });
  } catch (error) {
    console.error("Toggle doctor status error:", error);

    return res.status(500).json({
      message: "Failed to update doctor status",
    });
  }
};

// VERIFY DOCTOR
export const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    doctor.isVerified = !doctor.isVerified;

    await doctor.save();

    return res.status(200).json({
      message: `Doctor ${
        doctor.isVerified ? "verified" : "unverified"
      } successfully`,
      doctor,
    });
  } catch (error) {
    console.error("Verify doctor error:", error);

    return res.status(500).json({
      message: "Failed to update doctor verification status",
    });
  }
};
