import mongoose from "mongoose";
import MedicalRecord from "../models/medicalRecordModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a medical record for a completed appointment
export const createMedicalRecord = async (req, res) => {
  try {
    const {
      patient,
      appointment,
      symptoms,
      diagnosis,
      treatment,
      notes,
      attachments,
    } = req.body;

    if (!patient || !appointment || !diagnosis) {
      return res.status(400).json({
        message: "Patient, appointment, and diagnosis are required",
      });
    }

    if (!isValidObjectId(patient) || !isValidObjectId(appointment)) {
      return res.status(400).json({
        message: "Invalid patient or appointment ID",
      });
    }

    const doctor = await Doctor.findOne({
      user: req.user.userId,
      isActive: true,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Active doctor profile not found",
      });
    }

    const patientRecord = await Patient.findById(patient);

    if (!patientRecord) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const appointmentRecord = await Appointment.findById(appointment);

    if (!appointmentRecord) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (
      appointmentRecord.patient.toString() !==
      patientRecord._id.toString()
    ) {
      return res.status(403).json({
        message: "This appointment does not belong to the selected patient",
      });
    }

    if (
      appointmentRecord.doctor.toString() !== doctor._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only create medical records for your own appointments",
      });
    }

    if (appointmentRecord.status !== "completed") {
      return res.status(400).json({
        message: "Medical records can only be created for completed appointments",
      });
    }

    const existingRecord = await MedicalRecord.findOne({
      appointment: appointmentRecord._id,
    });

    if (existingRecord) {
      return res.status(409).json({
        message: "A medical record already exists for this appointment",
      });
    }

    if (typeof diagnosis !== "string" || diagnosis.trim().length === 0) {
      return res.status(400).json({
        message: "Diagnosis cannot be empty",
      });
    }

    if (diagnosis.length > 1000) {
      return res.status(400).json({
        message: "Diagnosis cannot exceed 1000 characters",
      });
    }

    if (treatment !== undefined && treatment !== null) {
      if (typeof treatment !== "string") {
        return res.status(400).json({
          message: "Treatment must be a string",
        });
      }

      if (treatment.length > 2000) {
        return res.status(400).json({
          message: "Treatment cannot exceed 2000 characters",
        });
      }
    }

    if (notes !== undefined && notes !== null) {
      if (typeof notes !== "string") {
        return res.status(400).json({
          message: "Notes must be a string",
        });
      }

      if (notes.length > 5000) {
        return res.status(400).json({
          message: "Notes cannot exceed 5000 characters",
        });
      }
    }

    if (symptoms !== undefined) {
      if (!Array.isArray(symptoms)) {
        return res.status(400).json({
          message: "Symptoms must be an array",
        });
      }

      if (
        symptoms.some(
          (symptom) =>
            typeof symptom !== "string" ||
            symptom.trim().length === 0
        )
      ) {
        return res.status(400).json({
          message: "Each symptom must be a non-empty string",
        });
      }
    }

    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) {
        return res.status(400).json({
          message: "Attachments must be an array",
        });
      }

      for (const attachment of attachments) {
        if (!attachment || typeof attachment !== "object") {
          return res.status(400).json({
            message: "Each attachment must be an object",
          });
        }

        if (!attachment.name || !attachment.url) {
          return res.status(400).json({
            message: "Each attachment must have a name and URL",
          });
        }
      }
    }

    const medicalRecord = await MedicalRecord.create({
      patient: patientRecord._id,
      doctor: doctor._id,
      appointment: appointmentRecord._id,
      symptoms: symptoms || [],
      diagnosis: diagnosis.trim(),
      treatment: treatment?.trim(),
      notes: notes?.trim(),
      attachments: attachments || [],
    });

    await medicalRecord.populate([
      {
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      },
      {
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "firstName lastName email phone",
          },
          {
            path: "department",
            select: "name",
          },
        ],
      },
      {
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      },
    ]);

    return res.status(201).json({
      message: "Medical record created successfully",
      medicalRecord,
    });
  } catch (error) {
    console.error("Create medical record error:", error);

    return res.status(500).json({
      message: "Failed to create medical record",
    });
  }
};

// Get all medical records belonging to the logged-in patient
export const getMyMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    const records = await MedicalRecord.find({
      patient: patient._id,
    })
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "firstName lastName email phone",
          },
          {
            path: "department",
            select: "name",
          },
        ],
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Medical records retrieved successfully",
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get patient medical records error:", error);

    return res.status(500).json({
      message: "Failed to retrieve medical records",
    });
  }
};

// Get medical records created by the logged-in doctor
export const getMyDoctorMedicalRecords = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.userId,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const records = await MedicalRecord.find({
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
      message: "Medical records retrieved successfully",
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get doctor medical records error:", error);

    return res.status(500).json({
      message: "Failed to retrieve medical records",
    });
  }
};

// Get one medical record with role-based access
export const getMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid medical record ID",
      });
    }

    const record = await MedicalRecord.findById(id)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "firstName lastName email phone",
          },
          {
            path: "department",
            select: "name",
          },
        ],
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      });

    if (!record) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    if (req.user.role === "admin") {
      return res.status(200).json({
        message: "Medical record retrieved successfully",
        record,
      });
    }

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        user: req.user.userId,
      });

      if (!patient) {
        return res.status(404).json({
          message: "Patient profile not found",
        });
      }

      if (record.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({
          message: "You do not have permission to view this medical record",
        });
      }
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      if (record.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: "You do not have permission to view this medical record",
        });
      }
    }

    return res.status(200).json({
      message: "Medical record retrieved successfully",
      record,
    });
  } catch (error) {
    console.error("Get medical record error:", error);

    return res.status(500).json({
      message: "Failed to retrieve medical record",
    });
  }
};

// Update an existing medical record
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      symptoms,
      diagnosis,
      treatment,
      notes,
      attachments,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid medical record ID",
      });
    }

    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      if (record.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: "You can only update medical records you created",
        });
      }
    }

    if (symptoms !== undefined) {
      if (!Array.isArray(symptoms)) {
        return res.status(400).json({
          message: "Symptoms must be an array",
        });
      }

      if (
        symptoms.some(
          (symptom) =>
            typeof symptom !== "string" ||
            symptom.trim().length === 0
        )
      ) {
        return res.status(400).json({
          message: "Each symptom must be a non-empty string",
        });
      }

      record.symptoms = symptoms;
    }

    if (diagnosis !== undefined) {
      if (typeof diagnosis !== "string" || diagnosis.trim().length === 0) {
        return res.status(400).json({
          message: "Diagnosis cannot be empty",
        });
      }

      if (diagnosis.length > 1000) {
        return res.status(400).json({
          message: "Diagnosis cannot exceed 1000 characters",
        });
      }

      record.diagnosis = diagnosis.trim();
    }

    if (treatment !== undefined) {
      if (treatment !== null && typeof treatment !== "string") {
        return res.status(400).json({
          message: "Treatment must be a string",
        });
      }

      if (typeof treatment === "string" && treatment.length > 2000) {
        return res.status(400).json({
          message: "Treatment cannot exceed 2000 characters",
        });
      }

      record.treatment =
        treatment === null ? undefined : treatment.trim();
    }

    if (notes !== undefined) {
      if (notes !== null && typeof notes !== "string") {
        return res.status(400).json({
          message: "Notes must be a string",
        });
      }

      if (typeof notes === "string" && notes.length > 5000) {
        return res.status(400).json({
          message: "Notes cannot exceed 5000 characters",
        });
      }

      record.notes = notes === null ? undefined : notes.trim();
    }

    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) {
        return res.status(400).json({
          message: "Attachments must be an array",
        });
      }

      for (const attachment of attachments) {
        if (!attachment || typeof attachment !== "object") {
          return res.status(400).json({
            message: "Each attachment must be an object",
          });
        }

        if (!attachment.name || !attachment.url) {
          return res.status(400).json({
            message: "Each attachment must have a name and URL",
          });
        }
      }

      record.attachments = attachments;
    }

    await record.save();

    await record.populate([
      {
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      },
      {
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "firstName lastName email phone",
          },
          {
            path: "department",
            select: "name",
          },
        ],
      },
      {
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      },
    ]);

    return res.status(200).json({
      message: "Medical record updated successfully",
      record,
    });
  } catch (error) {
    console.error("Update medical record error:", error);

    return res.status(500).json({
      message: "Failed to update medical record",
    });
  }
};

// Get all medical records for admin
export const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "firstName lastName email phone",
        },
      })
      .populate({
        path: "doctor",
        populate: [
          {
            path: "user",
            select: "firstName lastName email phone",
          },
          {
            path: "department",
            select: "name",
          },
        ],
      })
      .populate({
        path: "appointment",
        select: "date startTime endTime type status reasonForVisit",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Medical records retrieved successfully",
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get all medical records error:", error);

    return res.status(500).json({
      message: "Failed to retrieve medical records",
    });
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid medical record ID",
      });
    }

    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    await record.deleteOne();

    return res.status(200).json({
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    console.error("Delete medical record error:", error);

    return res.status(500).json({
      message: "Failed to delete medical record",
    });
  }
};