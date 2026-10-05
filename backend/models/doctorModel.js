import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    // USER ACCOUNT

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User account is required"],
      unique: true,
    },

    // PROFESSIONAL INFORMATION


    licenseNumber: {
      type: String,
      required: [true, "Medical license number is required"],
      unique: true,
      trim: true,
      maxlength: [50, "License number cannot exceed 50 characters"],
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      maxlength: [100, "Specialization cannot exceed 100 characters"],
    },

    qualification: {
      type: [String],
      required: [true, "At least one qualification is required"],
      validate: {
        validator: function (qualifications) {
          return qualifications.length > 0;
        },
        message: "Doctor must have at least one qualification",
      },
    },

    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [70, "Experience cannot exceed 70 years"],
      default: 0,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },

    consultationFee: {
      type: Number,
      min: [0, "Consultation fee cannot be negative"],
      default: 0,
    },


    // DEPARTMENT


    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },


    // AVAILABILITY


    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },

        startTime: {
          type: String,
        },

        endTime: {
          type: String,
        },

        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],


    // VERIFICATION

    isVerified: {
      type: Boolean,
      default: false,
    },

  
    // STATUS
  

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;