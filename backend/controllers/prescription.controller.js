import mongoose from "mongoose";
import Prescription from "../models/prescriptionModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a prescription for a completed appointment
export const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      appointment,
      medications,
      instructions,
      notes,
    } = req.body;

    // Validate required fields
    if (!patient || !appointment || !medications) {
      return res.status(400).json({
        message: "Patient, appointment, and medications are required",
      });
    }

    // Validate MongoDB IDs
    if (!isValidObjectId(patient) || !isValidObjectId(appointment)) {
      return res.status(400).json({
        message: "Invalid patient or appointment ID",
      });
    }

    // Validate medications
    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        message: "At least one medication is required",
      });
    }

    // Find the logged in doctor's profile
    const doctor = await Doctor.findOne({
      user: req.user.userId,
      isActive: true,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Active doctor profile not found",
      });
    }

    // Find the patient profile
    const patientRecord = await Patient.findById(patient);

    if (!patientRecord) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // Find the appointment
    const appointmentRecord = await Appointment.findById(appointment);

    if (!appointmentRecord) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Make sure the appointment belongs to the selected patient
    if (
      appointmentRecord.patient.toString() !== patientRecord._id.toString()
    ) {
      return res.status(403).json({
        message: "This appointment does not belong to the selected patient",
      });
    }

    // Make sure the appointment belongs to the logged-in doctor
    if (appointmentRecord.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        message: "You can only create prescriptions for your own appointments",
      });
    }

    // Only completed appointments can have prescriptions
    if (appointmentRecord.status !== "completed") {
      return res.status(400).json({
        message: "Prescriptions can only be created for completed appointments",
      });
    }

    // Validate each medication
    for (const medication of medications) {
      if (!medication || typeof medication !== "object") {
        return res.status(400).json({
          message: "Each medication must be an object",
        });
      }

      if (!medication.name) {
        return res.status(400).json({
          message: "Medication name is required",
        });
      }

      if (!medication.dosage) {
        return res.status(400).json({
          message: "Medication dosage is required",
        });
      }

      if (!medication.frequency) {
        return res.status(400).json({
          message: "Medication frequency is required",
        });
      }

      if (!medication.duration) {
        return res.status(400).json({
          message: "Medication duration is required",
        });
      }

      if (
        typeof medication.name !== "string" ||
        typeof medication.dosage !== "string" ||
        typeof medication.frequency !== "string" ||
        typeof medication.duration !== "string"
      ) {
        return res.status(400).json({
          message: "Medication fields must be strings",
        });
      }

      if (
        medication.instructions !== undefined &&
        medication.instructions !== null &&
        typeof medication.instructions !== "string"
      ) {
        return res.status(400).json({
          message: "Medication instructions must be a string",
        });
      }
    }

    // Validate general instructions
    if (instructions !== undefined && instructions !== null) {
      if (typeof instructions !== "string") {
        return res.status(400).json({
          message: "Instructions must be a string",
        });
      }

      if (instructions.length > 2000) {
        return res.status(400).json({
          message: "Instructions cannot exceed 2000 characters",
        });
      }
    }

    // Validate notes
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== "string") {
        return res.status(400).json({
          message: "Notes must be a string",
        });
      }

      if (notes.length > 2000) {
        return res.status(400).json({
          message: "Notes cannot exceed 2000 characters",
        });
      }
    }

    // Create the prescription
    const prescription = await Prescription.create({
      patient: patientRecord._id,
      doctor: doctor._id,
      appointment: appointmentRecord._id,
      medications: medications.map((medication) => ({
        name: medication.name.trim(),
        dosage: medication.dosage.trim(),
        frequency: medication.frequency.trim(),
        duration: medication.duration.trim(),
        instructions: medication.instructions?.trim(),
      })),
      instructions: instructions?.trim(),
      notes: notes?.trim(),
    });

    // Populate related information
    await prescription.populate([
      {
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      },
      {
        path: "doctor",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      },
      {
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      },
    ]);

    return res.status(201).json({
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(500).json({
      message: "Failed to create prescription",
    });
  }
};

// Get prescriptions belonging to the logged-in patient
export const getMyPrescriptions = async (req, res) => {
  try {
    // Find the patient profile linked to the logged-in user
    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    // Get only this patient's prescriptions
    const prescriptions = await Prescription.find({
      patient: patient._id,
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Prescriptions retrieved successfully",
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get patient prescriptions error:", error);

    return res.status(500).json({
      message: "Failed to retrieve prescriptions",
    });
  }
};

// Get prescriptions created by the logged-in doctor
export const getMyDoctorPrescriptions = async (req, res) => {
  try {
    // Find the doctor profile linked to the logged-in user
    const doctor = await Doctor.findOne({
      user: req.user.userId,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    // Get only prescriptions created by this doctor
    const prescriptions = await Prescription.find({
      doctor: doctor._id,
    })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Prescriptions retrieved successfully",
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get doctor prescriptions error:", error);

    return res.status(500).json({
      message: "Failed to retrieve prescriptions",
    });
  }
};

// Get one prescription with role-based access
export const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate prescription ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid prescription ID",
      });
    }

    // Find the prescription and populate related information
    const prescription = await Prescription.findById(id)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    // Admins can view any prescription
    if (req.user.role === "admin") {
      return res.status(200).json({
        message: "Prescription retrieved successfully",
        prescription,
      });
    }

    // Patients can only view their own prescriptions
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        user: req.user.userId,
      });

      if (!patient) {
        return res.status(404).json({
          message: "Patient profile not found",
        });
      }

      if (
        prescription.patient._id.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          message: "You do not have permission to view this prescription",
        });
      }
    }

    // Doctors can only view prescriptions they created
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      if (
        prescription.doctor._id.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          message: "You do not have permission to view this prescription",
        });
      }
    }

    return res.status(200).json({
      message: "Prescription retrieved successfully",
      prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(500).json({
      message: "Failed to retrieve prescription",
    });
  }
};

// Update a prescription
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      medications,
      instructions,
      notes,
      status,
    } = req.body;

    // Validate prescription ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid prescription ID",
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    // Doctors can only update prescriptions they created
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      if (prescription.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: "You can only update prescriptions you created",
        });
      }
    }

    // Validate and update medications
    if (medications !== undefined) {
      if (!Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({
          message: "At least one medication is required",
        });
      }

      for (const medication of medications) {
        if (!medication || typeof medication !== "object") {
          return res.status(400).json({
            message: "Each medication must be an object",
          });
        }

        if (!medication.name) {
          return res.status(400).json({
            message: "Medication name is required",
          });
        }

        if (!medication.dosage) {
          return res.status(400).json({
            message: "Medication dosage is required",
          });
        }

        if (!medication.frequency) {
          return res.status(400).json({
            message: "Medication frequency is required",
          });
        }

        if (!medication.duration) {
          return res.status(400).json({
            message: "Medication duration is required",
          });
        }

        if (
          typeof medication.name !== "string" ||
          typeof medication.dosage !== "string" ||
          typeof medication.frequency !== "string" ||
          typeof medication.duration !== "string"
        ) {
          return res.status(400).json({
            message: "Medication fields must be strings",
          });
        }

        if (
          medication.instructions !== undefined &&
          medication.instructions !== null &&
          typeof medication.instructions !== "string"
        ) {
          return res.status(400).json({
            message: "Medication instructions must be a string",
          });
        }
      }

      prescription.medications = medications.map((medication) => ({
        name: medication.name.trim(),
        dosage: medication.dosage.trim(),
        frequency: medication.frequency.trim(),
        duration: medication.duration.trim(),
        instructions: medication.instructions?.trim(),
      }));
    }

    // Validate and update general instructions
    if (instructions !== undefined) {
      if (instructions !== null && typeof instructions !== "string") {
        return res.status(400).json({
          message: "Instructions must be a string",
        });
      }

      if (
        typeof instructions === "string" &&
        instructions.length > 2000
      ) {
        return res.status(400).json({
          message: "Instructions cannot exceed 2000 characters",
        });
      }

      prescription.instructions =
        instructions === null ? undefined : instructions.trim();
    }

    // Validate and update notes
    if (notes !== undefined) {
      if (notes !== null && typeof notes !== "string") {
        return res.status(400).json({
          message: "Notes must be a string",
        });
      }

      if (typeof notes === "string" && notes.length > 2000) {
        return res.status(400).json({
          message: "Notes cannot exceed 2000 characters",
        });
      }

      prescription.notes =
        notes === null ? undefined : notes.trim();
    }

    // Validate and update prescription status
    if (status !== undefined) {
      if (!["active", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          message: "Invalid prescription status",
        });
      }

      prescription.status = status;
    }

    await prescription.save();

    // Populate related information for the response
    await prescription.populate([
      {
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      },
      {
        path: "doctor",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      },
      {
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      },
    ]);

    return res.status(200).json({
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    return res.status(500).json({
      message: "Failed to update prescription",
    });
  }
};

// Get all prescriptions for admins
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Prescriptions retrieved successfully",
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get all prescriptions error:", error);

    return res.status(500).json({
      message: "Failed to retrieve prescriptions",
    });
  }
};

// Delete a prescription
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate prescription ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid prescription ID",
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    await prescription.deleteOne();

    return res.status(200).json({
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(500).json({
      message: "Failed to delete prescription",
    });
  }
};

