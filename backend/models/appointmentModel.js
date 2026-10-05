import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {

    //people involved
    
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    date:      { type: Date, required: true },
    startTime: { type: String, required: true },  // "10:00"
    endTime:   { type: String, required: true },  // "10:30"
    type: {
      type: String,
      enum: ["consultation", "follow-up", "emergency", "routine-checkup"],
      default: "consultation",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
   reasonForVisit: {
  type: String,
  required: true,
  trim: true,
  maxlength: [500, "Reason for visit cannot exceed 500 characters"],
},

notes: {
  type: String,
  trim: true,
  maxlength: [1000, "Notes cannot exceed 1000 characters"],
},
    cancelReason: {
  type: String,
  trim: true,
  maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
  default: null,
},
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
