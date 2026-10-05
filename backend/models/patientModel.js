import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    bloodType: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "unknown",
      ],
      default: "unknown",
    },

    address: {
      type: String,
      trim: true,
    },

    allergies: [
      {
        type: String,
        trim: true,
      },
    ],

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },

    primaryDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    medicalHistory: {
      type: String,
      trim: true,
      maxlength: [3000, "Medical history cannot exceed 3000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: calculate age from date of birth
patientSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;

  const diff =
    Date.now() - new Date(this.dateOfBirth).getTime();

  return Math.floor(
    diff / (1000 * 60 * 60 * 24 * 365.25)
  );
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;