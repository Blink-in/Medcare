import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
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
    // MEDICATIONS

    medications: [
      {
        name: {
          type: String,
          required: [true, "Medication name is required"],
          trim: true,
        },

        dosage: {
          type: String,
          required: [true, "Medication dosage is required"],
          trim: true,
        },

        frequency: {
          type: String,
          required: [true, "Medication frequency is required"],
          trim: true,
        },

        duration: {
          type: String,
          required: [true, "Medication duration is required"],
          trim: true,
        },

        instructions: {
          type: String,
          trim: true,
        },
      },
    ],

    
    // GENERAL INSTRUCTIONS
    

    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, "Instructions cannot exceed 2000 characters"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    // STATUS

    status: {
      type: String,
      enum: {
        values: ["active", "completed", "cancelled"],
        message: "Invalid prescription status",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model(
  "Prescription",
  prescriptionSchema
);

export default Prescription;