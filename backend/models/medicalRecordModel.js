import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    // RELATIONSHIPS

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment is required"],
    },

    // CLINICAL INFORMATION

    symptoms: {
      type: [String],
      default: [],
    },

    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
      maxlength: [1000, "Diagnosis cannot exceed 1000 characters"],
    },

    treatment: {
      type: String,
      trim: true,
      maxlength: [2000, "Treatment cannot exceed 2000 characters"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [5000, "Clinical notes cannot exceed 5000 characters"],
    },

    // ATTACHMENTS

    attachments: [
      {
        name: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
          trim: true,
        },

        type: {
          type: String,
          trim: true,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);

export default MedicalRecord;