import mongoose from "mongoose";

import Patient from "../models/patientModel.js";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";

// CREATE PATIENT PROFILE
export const createPatient = async (req, res) => {
  try {
    const {
      user,
      dateOfBirth,
      gender,
      bloodType,
      address,
      allergies,
      emergencyContact,
      primaryDoctor,
      medicalHistory,
    } = req.body;

    // Required fields
    if (!user || !dateOfBirth || !gender) {
      return res.status(400).json({
        message: "User, date of birth, and gender are required",
      });
    }

    // Validate User ID
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Find user
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // User must be a patient
    if (existingUser.role !== "patient") {
      return res.status(400).json({
        message: "Selected user does not have a patient role",
      });
    }

    // User must be active
    if (!existingUser.isActive) {
      return res.status(400).json({
        message: "Cannot create a patient profile for an inactive user",
      });
    }

    // Check if patient profile already exists
    const existingPatient = await Patient.findOne({ user });

    if (existingPatient) {
      return res.status(409).json({
        message: "This user already has a patient profile",
      });
    }

    // Validate date of birth
    const parsedDate = new Date(dateOfBirth);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date of birth",
      });
    }

    // Date of birth cannot be in the future
    if (parsedDate > new Date()) {
      return res.status(400).json({
        message: "Date of birth cannot be in the future",
      });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be male, female, or other",
      });
    }

    // Validate blood type
    const allowedBloodTypes = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
      "unknown",
    ];

    if (
      bloodType !== undefined &&
      !allowedBloodTypes.includes(bloodType)
    ) {
      return res.status(400).json({
        message: "Invalid blood type",
      });
    }

    // Validate allergies
    if (allergies !== undefined) {
      if (!Array.isArray(allergies)) {
        return res.status(400).json({
          message: "Allergies must be an array",
        });
      }

      if (
        allergies.some(
          (item) => typeof item !== "string" || !item.trim()
        )
      ) {
        return res.status(400).json({
          message: "All allergies must be non-empty strings",
        });
      }
    }

    // Validate primary doctor
    if (primaryDoctor !== undefined && primaryDoctor !== null) {
      if (!mongoose.Types.ObjectId.isValid(primaryDoctor)) {
        return res.status(400).json({
          message: "Invalid primary doctor ID",
        });
      }

      const doctor = await Doctor.findById(primaryDoctor);

      if (!doctor) {
        return res.status(404).json({
          message: "Primary doctor not found",
        });
      }

      if (!doctor.isActive) {
        return res.status(400).json({
          message: "Cannot assign an inactive doctor",
        });
      }
    }

    // Create patient
    const patient = await Patient.create({
      user,
      dateOfBirth: parsedDate,
      gender,
      bloodType,
      address,
      allergies: allergies
        ? allergies.map((item) => item.trim())
        : [],
      emergencyContact,
      primaryDoctor: primaryDoctor || null,
      medicalHistory,
    });

    // Populate related data
    const populatedPatient = await Patient.findById(patient._id)
      .populate(
        "user",
        "firstName lastName email phone role avatar isActive"
      )
      .populate(
        "primaryDoctor",
        "user licenseNumber specialization qualification"
      );

    return res.status(201).json({
      message: "Patient created successfully",
      patient: populatedPatient,
    });
  } catch (error) {
    console.error("Create patient error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This user already has a patient profile",
      });
    }

    return res.status(500).json({
      message: "Failed to create patient",
    });
  }
};

// GET ALL PATIENTS
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate(
        "user",
        "firstName lastName email phone role avatar isActive"
      )
      .populate(
        "primaryDoctor",
        "user licenseNumber specialization qualification"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return res.status(500).json({
      message: "Failed to retrieve patients",
    });
  }
};

// GET SINGLE PATIENT
export const getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id)
      .populate(
        "user",
        "firstName lastName email phone role avatar isActive"
      )
      .populate(
        "primaryDoctor",
        "user licenseNumber specialization qualification"
      );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      patient,
    });
  } catch (error) {
    console.error("Get patient error:", error);

    return res.status(500).json({
      message: "Failed to retrieve patient",
    });
  }
};

// GET MY PATIENT PROFILE
export const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      user: req.user.userId,
    })
      .populate(
        "user",
        "firstName lastName email phone role avatar isActive"
      )
      .populate(
        "primaryDoctor",
        "user licenseNumber specialization qualification"
      );

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      patient,
    });
  } catch (error) {
    console.error("Get my patient profile error:", error);

    return res.status(500).json({
      message: "Failed to retrieve patient profile",
    });
  }
};

// UPDATE PATIENT
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      dateOfBirth,
      gender,
      bloodType,
      address,
      allergies,
      emergencyContact,
      primaryDoctor,
      medicalHistory,
    } = req.body;

    // Validate Patient ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // Update date of birth
    if (dateOfBirth !== undefined) {
      const parsedDate = new Date(dateOfBirth);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date of birth",
        });
      }

      if (parsedDate > new Date()) {
        return res.status(400).json({
          message: "Date of birth cannot be in the future",
        });
      }

      patient.dateOfBirth = parsedDate;
    }

    // Update gender
    if (gender !== undefined) {
      if (!["male", "female", "other"].includes(gender)) {
        return res.status(400).json({
          message: "Gender must be male, female, or other",
        });
      }

      patient.gender = gender;
    }

    // Update blood type
    if (bloodType !== undefined) {
      const allowedBloodTypes = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "unknown",
      ];

      if (!allowedBloodTypes.includes(bloodType)) {
        return res.status(400).json({
          message: "Invalid blood type",
        });
      }

      patient.bloodType = bloodType;
    }

    // Update address
    if (address !== undefined) {
      if (typeof address !== "string") {
        return res.status(400).json({
          message: "Address must be a string",
        });
      }

      patient.address = address.trim();
    }

    // Update allergies
    if (allergies !== undefined) {
      if (!Array.isArray(allergies)) {
        return res.status(400).json({
          message: "Allergies must be an array",
        });
      }

      if (
        allergies.some(
          (item) => typeof item !== "string" || !item.trim()
        )
      ) {
        return res.status(400).json({
          message: "All allergies must be non-empty strings",
        });
      }

      patient.allergies = allergies.map((item) => item.trim());
    }

    // Update emergency contact
    if (emergencyContact !== undefined) {
      if (
        emergencyContact === null ||
        typeof emergencyContact !== "object" ||
        Array.isArray(emergencyContact)
      ) {
        return res.status(400).json({
          message: "Emergency contact must be an object",
        });
      }

      patient.emergencyContact = emergencyContact;
    }

    // Update primary doctor
    if (primaryDoctor !== undefined) {
      if (primaryDoctor === null) {
        patient.primaryDoctor = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(primaryDoctor)) {
          return res.status(400).json({
            message: "Invalid primary doctor ID",
          });
        }

        const doctor = await Doctor.findById(primaryDoctor);

        if (!doctor) {
          return res.status(404).json({
            message: "Primary doctor not found",
          });
        }

        if (!doctor.isActive) {
          return res.status(400).json({
            message: "Cannot assign an inactive doctor",
          });
        }

        patient.primaryDoctor = primaryDoctor;
      }
    }

    // Update medical history
    if (medicalHistory !== undefined) {
      if (typeof medicalHistory !== "string") {
        return res.status(400).json({
          message: "Medical history must be a string",
        });
      }

      patient.medicalHistory = medicalHistory.trim();
    }

    await patient.save();

    const updatedPatient = await Patient.findById(patient._id)
      .populate(
        "user",
        "firstName lastName email phone role avatar isActive"
      )
      .populate(
        "primaryDoctor",
        "user licenseNumber specialization qualification"
      );

    return res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);

    return res.status(500).json({
      message: "Failed to update patient",
    });
  }
};

// UPDATE MY PATIENT PROFILE
export const updateMyPatientProfile = async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodType,
      address,
      allergies,
      emergencyContact,
      medicalHistory,
    } = req.body;

    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    // Update date of birth
    if (dateOfBirth !== undefined) {
      const parsedDate = new Date(dateOfBirth);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date of birth",
        });
      }

      if (parsedDate > new Date()) {
        return res.status(400).json({
          message: "Date of birth cannot be in the future",
        });
      }

      patient.dateOfBirth = parsedDate;
    }

    // Update gender
    if (gender !== undefined) {
      if (!["male", "female", "other"].includes(gender)) {
        return res.status(400).json({
          message: "Gender must be male, female, or other",
        });
      }

      patient.gender = gender;
    }

    // Update blood type
    if (bloodType !== undefined) {
      const allowedBloodTypes = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "unknown",
      ];

      if (!allowedBloodTypes.includes(bloodType)) {
        return res.status(400).json({
          message: "Invalid blood type",
        });
      }

      patient.bloodType = bloodType;
    }

    // Update address
    if (address !== undefined) {
      if (typeof address !== "string") {
        return res.status(400).json({
          message: "Address must be a string",
        });
      }

      patient.address = address.trim();
    }

    // Update allergies
    if (allergies !== undefined) {
      if (!Array.isArray(allergies)) {
        return res.status(400).json({
          message: "Allergies must be an array",
        });
      }

      if (
        allergies.some(
          (item) => typeof item !== "string" || !item.trim()
        )
      ) {
        return res.status(400).json({
          message: "All allergies must be non-empty strings",
        });
      }

      patient.allergies = allergies.map((item) => item.trim());
    }

    // Update emergency contact
    if (emergencyContact !== undefined) {
      if (
        emergencyContact === null ||
        typeof emergencyContact !== "object" ||
        Array.isArray(emergencyContact)
      ) {
        return res.status(400).json({
          message: "Emergency contact must be an object",
        });
      }

      patient.emergencyContact = emergencyContact;
    }

    // Patients cannot change their primary doctor here.
    // Only admins can assign/change primaryDoctor.

    // Update medical history
    if (medicalHistory !== undefined) {
      if (typeof medicalHistory !== "string") {
        return res.status(400).json({
          message: "Medical history must be a string",
        });
      }

      patient.medicalHistory = medicalHistory.trim();
    }

    await patient.save();

    const updatedPatient = await Patient.findById(patient._id)
      .populate(
        "user",
        "firstName lastName email phone role avatar isActive"
      )
      .populate(
        "primaryDoctor",
        "user licenseNumber specialization qualification"
      );

    return res.status(200).json({
      message: "Patient profile updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update my patient profile error:", error);

    return res.status(500).json({
      message: "Failed to update patient profile",
    });
  }
};

// DELETE PATIENT
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    await patient.deleteOne();

    return res.status(200).json({
      message: "Patient profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete patient error:", error);

    return res.status(500).json({
      message: "Failed to delete patient",
    });
  }
};

export default {
  createPatient,
  getPatients,
  getPatient,
  getMyPatientProfile,
  updatePatient,
  updateMyPatientProfile,
  deletePatient,
};