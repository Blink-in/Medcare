import mongoose from "mongoose";

import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Department from "../models/departmentModel.js";
import User from "../models/userModel.js";


// HELPERS


const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isValidAppointmentType = (type) => {
  return [
    "consultation",
    "follow-up",
    "emergency",
    "routine-checkup",
  ].includes(type);
};

const isValidStatus = (status) => {
  return [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ].includes(status);
};


// PATIENT - CREATE APPOINTMENT


export const createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      department,
      date,
      startTime,
      endTime,
      type,
      reasonForVisit,
      notes,
    } = req.body;


    // Validate required fields


    if (
      !doctor ||
      !department ||
      !date ||
      !startTime ||
      !endTime ||
      !reasonForVisit
    ) {
      return res.status(400).json({
        message:
          "Doctor, department, date, start time, end time, and reason for visit are required",
      });
    }


    // Validate IDs


    if (!isValidObjectId(doctor)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    if (!isValidObjectId(department)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }


    // Find patient's profile


    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message:
          "Patient profile not found. Please create your patient profile first.",
      });
    }


    // Check patient's account


    const patientUser = await User.findById(patient.user);

    if (!patientUser) {
      return res.status(404).json({
        message: "Patient user account not found",
      });
    }

    if (!patientUser.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }


    // Find doctor


    const doctorRecord = await Doctor.findById(doctor);

    if (!doctorRecord) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (!doctorRecord.isActive) {
      return res.status(403).json({
        message: "This doctor is currently unavailable",
      });
    }


    // Find department


    const departmentRecord = await Department.findById(department);

    if (!departmentRecord) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    if (!departmentRecord.isActive) {
      return res.status(403).json({
        message: "This department is currently unavailable",
      });
    }


    // Make sure doctor belongs
    // to selected department


    if (
      doctorRecord.department.toString() !==
      departmentRecord._id.toString()
    ) {
      return res.status(400).json({
        message:
          "The selected doctor does not belong to the selected department",
      });
    }


    // Validate date


    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    // Normalize appointment date
    appointmentDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        message: "Appointment date cannot be in the past",
      });
    }


    // Validate time


    if (!isValidTime(startTime)) {
      return res.status(400).json({
        message: "Invalid start time. Use HH:mm format",
      });
    }

    if (!isValidTime(endTime)) {
      return res.status(400).json({
        message: "Invalid end time. Use HH:mm format",
      });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        message: "End time must be later than start time",
      });
    }


    // Validate appointment type


    if (type && !isValidAppointmentType(type)) {
      return res.status(400).json({
        message:
          "Invalid appointment type. Allowed types are consultation, follow-up, emergency, and routine-checkup",
      });
    }


    // Validate reason


    if (
      typeof reasonForVisit !== "string" ||
      reasonForVisit.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Reason for visit cannot be empty",
      });
    }

    if (reasonForVisit.trim().length > 500) {
      return res.status(400).json({
        message: "Reason for visit cannot exceed 500 characters",
      });
    }


    // Validate notes


    if (notes && notes.length > 1000) {
      return res.status(400).json({
        message: "Notes cannot exceed 1000 characters",
      });
    }


    // Check doctor availability


    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const appointmentDay = days[appointmentDate.getDay()];

    const doctorAvailability = doctorRecord.availability?.find(
      (slot) => slot.day === appointmentDay
    );

    if (doctorAvailability) {
      if (doctorAvailability.isAvailable === false) {
        return res.status(400).json({
          message: `Doctor is not available on ${appointmentDay}`,
        });
      }

      if (
        doctorAvailability.startTime &&
        doctorAvailability.endTime
      ) {
        const availableStart = timeToMinutes(
          doctorAvailability.startTime
        );

        const availableEnd = timeToMinutes(
          doctorAvailability.endTime
        );

        if (
          startMinutes < availableStart ||
          endMinutes > availableEnd
        ) {
          return res.status(400).json({
            message: `Doctor is available on ${appointmentDay} from ${doctorAvailability.startTime} to ${doctorAvailability.endTime}`,
          });
        }
      }
    }


    // Check doctor appointment conflict


    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const doctorConflict = await Appointment.findOne({
      doctor: doctorRecord._id,
      date: {
        $gte: dayStart,
        $lte: dayEnd,
      },
      status: {
        $ne: "cancelled",
      },
      startTime: {
        $lt: endTime,
      },
      endTime: {
        $gt: startTime,
      },
    });

    if (doctorConflict) {
      return res.status(409).json({
        message:
          "The doctor already has an appointment during this time",
      });
    }


    // Check patient's own conflict


    const patientConflict = await Appointment.findOne({
      patient: patient._id,
      date: {
        $gte: dayStart,
        $lte: dayEnd,
      },
      status: {
        $ne: "cancelled",
      },
      startTime: {
        $lt: endTime,
      },
      endTime: {
        $gt: startTime,
      },
    });

    if (patientConflict) {
      return res.status(409).json({
        message:
          "You already have another appointment during this time",
      });
    }


    // Create appointment


    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorRecord._id,
      department: departmentRecord._id,
      date: appointmentDate,
      startTime,
      endTime,
      type: type || "consultation",
      status: "pending",
      reasonForVisit: reasonForVisit.trim(),
      notes: notes?.trim() || undefined,
    });


    // Return populated appointment


    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate(
        "patient",
        "user dateOfBirth gender bloodType address allergies emergencyContact"
      )
      .populate(
        "doctor",
        "user licenseNumber specialization qualification experience consultationFee"
      )
      .populate(
        "department",
        "name description location"
      );

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      message: "Failed to create appointment. Please try again later.",
    });
  }
};

// PATIENT - UPDATE OWN PENDING APPOINTMENT

export const updateMyAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctor,
      department,
      date,
      startTime,
      type,
      reasonForVisit,
      notes,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    // Reject fields patients are not allowed to change
    const protectedFields = ["patient", "status", "cancelReason", "endTime"];

    if (protectedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    )) {
      return res.status(400).json({
        message: "You cannot change protected appointment fields",
      });
    }

    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to edit this appointment",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        message: "Only pending appointments can be edited",
      });
    }

    // Require all editable booking fields
    if (
      !doctor ||
      !department ||
      !date ||
      !startTime ||
      !type ||
      typeof reasonForVisit !== "string" ||
      !reasonForVisit.trim()
    ) {
      return res.status(400).json({
        message: "Doctor, department, date, start time, type, and reason are required",
      });
    }

    if (!isValidObjectId(doctor)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    if (!isValidObjectId(department)) {
      return res.status(400).json({
        message: "Invalid department ID",
      });
    }

    if (!isValidTime(startTime)) {
      return res.status(400).json({
        message: "Invalid start time. Use HH:mm format",
      });
    }

    if (!isValidAppointmentType(type)) {
      return res.status(400).json({
        message: "Invalid appointment type",
      });
    }

    if (reasonForVisit.trim().length > 500) {
      return res.status(400).json({
        message: "Reason for visit cannot exceed 500 characters",
      });
    }

    if (notes !== undefined && (
      typeof notes !== "string" || notes.length > 1000
    )) {
      return res.status(400).json({
        message: "Notes must be text and cannot exceed 1000 characters",
      });
    }

    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    appointmentDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        message: "Appointment date cannot be in the past",
      });
    }

    // Appointments have a fixed 30-minute duration
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + 30;

    if (endMinutes > 24 * 60) {
      return res.status(400).json({
        message: "Please choose an earlier start time",
      });
    }

    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const [doctorRecord, departmentRecord] = await Promise.all([
      Doctor.findById(doctor),
      Department.findById(department),
    ]);

    if (!doctorRecord) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (!doctorRecord.isActive) {
      return res.status(400).json({
        message: "The selected doctor is currently unavailable",
      });
    }

    if (!departmentRecord) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    if (!departmentRecord.isActive) {
      return res.status(400).json({
        message: "The selected department is currently unavailable",
      });
    }

    if (
      !doctorRecord.department ||
      doctorRecord.department.toString() !== departmentRecord._id.toString()
    ) {
      return res.status(400).json({
        message: "The selected doctor does not belong to the selected department",
      });
    }

    // Check the doctor's working hours for the selected day
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const appointmentDay = days[appointmentDate.getDay()];
    const availability = doctorRecord.availability?.find(
      (slot) => slot.day === appointmentDay
    );

    if (availability) {
      if (availability.isAvailable === false) {
        return res.status(400).json({
          message: `Doctor is not available on ${appointmentDay}`,
        });
      }

      if (availability.startTime && availability.endTime) {
        const availableStart = timeToMinutes(availability.startTime);
        const availableEnd = timeToMinutes(availability.endTime);

        if (startMinutes < availableStart || endMinutes > availableEnd) {
          return res.status(400).json({
            message: `Doctor is available on ${appointmentDay} from ${availability.startTime} to ${availability.endTime}`,
          });
        }
      }
    }

    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Exclude this appointment when checking for conflicts
    const conflictQuery = {
      _id: { $ne: appointment._id },
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "cancelled" },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };

    const [doctorConflict, patientConflict] = await Promise.all([
      Appointment.findOne({
        ...conflictQuery,
        doctor: doctorRecord._id,
      }),
      Appointment.findOne({
        ...conflictQuery,
        patient: patient._id,
      }),
    ]);

    if (doctorConflict) {
      return res.status(409).json({
        message: "The doctor already has an appointment during this time",
      });
    }

    if (patientConflict) {
      return res.status(409).json({
        message: "You already have another appointment during this time",
      });
    }

    appointment.doctor = doctorRecord._id;
    appointment.department = departmentRecord._id;
    appointment.date = appointmentDate;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.type = type;
    appointment.reasonForVisit = reasonForVisit.trim();
    appointment.notes = notes?.trim() || undefined;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: "doctor",
        select: "user licenseNumber specialization",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      })
      .populate("department", "name description location");

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Update patient appointment error:", error);

    return res.status(500).json({
      message: "Failed to update appointment. Please try again later.",
    });
  }
};


// PATIENT - GET MY APPOINTMENTS


export const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    const appointments = await Appointment.find({
      patient: patient._id,
    })
      .populate({
        path: "doctor",
        select:
          "user licenseNumber specialization qualification experience consultationFee",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      })
      .populate(
        "department",
        "name description location"
      )
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      message: "Appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    console.error("Get my appointments error:", error);

    return res.status(500).json({
      message:
        "Failed to retrieve your appointments. Please try again later.",
    });
  }
};


export const getMyDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.userId,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .populate({
        path: "patient",
        select:
          "user dateOfBirth gender bloodType address allergies emergencyContact",
        populate: {
          path: "user",
          select: "firstName lastName email phone avatar",
        },
      })
      .populate(
        "department",
        "name description location"
      )
      .sort({ date: -1, startTime: -1 });

    return res.status(200).json({
      message: "Doctor appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      message:
        "Failed to retrieve doctor appointments. Please try again later.",
    });
  }
};


// GET SINGLE APPOINTMENT


export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate(
        "patient",
        "user dateOfBirth gender bloodType address allergies emergencyContact"
      )
      .populate(
        "doctor",
        "user licenseNumber specialization qualification experience consultationFee"
      )
      .populate(
        "department",
        "name description location"
      );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }


    // Admin can view everything


    if (req.user.role === "admin") {
      return res.status(200).json({
        message: "Appointment retrieved successfully",
        appointment,
      });
    }


    // Patient ownership check


    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        user: req.user.userId,
      });

      if (
        !patient ||
        appointment.patient._id.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to view this appointment",
        });
      }
    }


    // Doctor ownership check


    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      });

      if (
        !doctor ||
        appointment.doctor._id.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to view this appointment",
        });
      }
    }

    return res.status(200).json({
      message: "Appointment retrieved successfully",
      appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);

    return res.status(500).json({
      message:
        "Failed to retrieve appointment. Please try again later.",
    });
  }
};


// PATIENT - CANCEL OWN APPOINTMENT


export const cancelMyAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const patient = await Patient.findOne({
      user: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (
      appointment.patient.toString() !== patient._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to cancel this appointment",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "A completed appointment cannot be cancelled",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment is already cancelled",
      });
    }

    if (cancelReason && cancelReason.length > 500) {
      return res.status(400).json({
        message: "Cancellation reason cannot exceed 500 characters",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelReason =
      cancelReason?.trim() || "Cancelled by patient";

    await appointment.save();

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      message:
        "Failed to cancel appointment. Please try again later.",
    });
  }
};


// DOCTOR - UPDATE APPOINTMENT STATUS


export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Appointment status is required",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed statuses are pending, confirmed, completed, and cancelled",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }


    // Doctor can only modify
    // their own appointments


    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        user: req.user.userId,
      });

      if (
        !doctor ||
        appointment.doctor.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to modify this appointment",
        });
      }
    }


    // Completed appointments
    // cannot be changed


    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "A completed appointment cannot be changed",
      });
    }


    // Cancelled appointments
    // cannot be changed


    if (
      appointment.status === "cancelled" &&
      status !== "cancelled"
    ) {
      return res.status(400).json({
        message:
          "A cancelled appointment cannot be changed to another status",
      });
    }


    // Cancellation reason


    if (status === "cancelled") {
      if (cancelReason && cancelReason.length > 500) {
        return res.status(400).json({
          message:
            "Cancellation reason cannot exceed 500 characters",
        });
      }

      appointment.cancelReason =
        cancelReason?.trim() ||
        (req.user.role === "doctor"
          ? "Cancelled by doctor"
          : "Cancelled by admin");
    }

    appointment.status = status;

    await appointment.save();

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate(
        "patient",
        "user dateOfBirth gender bloodType address allergies emergencyContact"
      )
      .populate(
        "doctor",
        "user licenseNumber specialization qualification experience consultationFee"
      )
      .populate(
        "department",
        "name description location"
      );

    return res.status(200).json({
      message: "Appointment status updated successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    return res.status(500).json({
      message:
        "Failed to update appointment status. Please try again later.",
    });
  }
};


// ADMIN - GET ALL APPOINTMENTS


// ADMIN - GET ALL APPOINTMENTS
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "patient",
        select: "user dateOfBirth gender bloodType",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      })
      .populate({
        path: "doctor",
        select: "user licenseNumber specialization",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      })
      .populate("department", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      message: "Failed to retrieve appointments. Please try again later.",
    });
  }
};

// ADMIN - UPDATE APPOINTMENT


export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      doctor,
      department,
      date,
      startTime,
      endTime,
      type,
      reasonForVisit,
      notes,
      status,
      cancelReason,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }


    // Validate doctor if provided


    if (doctor !== undefined) {
      if (!isValidObjectId(doctor)) {
        return res.status(400).json({
          message: "Invalid doctor ID",
        });
      }

      const doctorRecord = await Doctor.findById(doctor);

      if (!doctorRecord) {
        return res.status(404).json({
          message: "Doctor not found",
        });
      }

      if (!doctorRecord.isActive) {
        return res.status(400).json({
          message: "Selected doctor is inactive",
        });
      }

      appointment.doctor = doctor;
    }


    // Validate department if provided


    if (department !== undefined) {
      if (!isValidObjectId(department)) {
        return res.status(400).json({
          message: "Invalid department ID",
        });
      }

      const departmentRecord = await Department.findById(
        department
      );

      if (!departmentRecord) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      if (!departmentRecord.isActive) {
        return res.status(400).json({
          message: "Selected department is inactive",
        });
      }

      appointment.department = department;
    }


    // Make sure doctor belongs
    // to department


    const currentDoctor = await Doctor.findById(
      appointment.doctor
    );

    if (
      currentDoctor &&
      currentDoctor.department.toString() !==
        appointment.department.toString()
    ) {
      return res.status(400).json({
        message:
          "The selected doctor does not belong to the selected department",
      });
    }


    // Validate date


    if (date !== undefined) {
      const newDate = new Date(date);

      if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({
          message: "Invalid appointment date",
        });
      }

      newDate.setHours(0, 0, 0, 0);

      appointment.date = newDate;
    }


    // Validate times


    if (startTime !== undefined) {
      if (!isValidTime(startTime)) {
        return res.status(400).json({
          message: "Invalid start time. Use HH:mm format",
        });
      }

      appointment.startTime = startTime;
    }

    if (endTime !== undefined) {
      if (!isValidTime(endTime)) {
        return res.status(400).json({
          message: "Invalid end time. Use HH:mm format",
        });
      }

      appointment.endTime = endTime;
    }

    if (
      timeToMinutes(appointment.startTime) >=
      timeToMinutes(appointment.endTime)
    ) {
      return res.status(400).json({
        message: "End time must be later than start time",
      });
    }


    // Type


    if (type !== undefined) {
      if (!isValidAppointmentType(type)) {
        return res.status(400).json({
          message: "Invalid appointment type",
        });
      }

      appointment.type = type;
    }


    // Reason


    if (reasonForVisit !== undefined) {
      if (
        typeof reasonForVisit !== "string" ||
        reasonForVisit.trim().length === 0
      ) {
        return res.status(400).json({
          message: "Reason for visit cannot be empty",
        });
      }

      if (reasonForVisit.trim().length > 500) {
        return res.status(400).json({
          message:
            "Reason for visit cannot exceed 500 characters",
        });
      }

      appointment.reasonForVisit = reasonForVisit.trim();
    }


    // Notes


    if (notes !== undefined) {
      if (notes && notes.length > 1000) {
        return res.status(400).json({
          message: "Notes cannot exceed 1000 characters",
        });
      }

      appointment.notes = notes?.trim();
    }


    // Status


    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          message: "Invalid appointment status",
        });
      }

      appointment.status = status;
    }

    // Cancel reason
    

    if (cancelReason !== undefined) {
      if (cancelReason && cancelReason.length > 500) {
        return res.status(400).json({
          message:
            "Cancellation reason cannot exceed 500 characters",
        });
      }

      appointment.cancelReason =
        cancelReason?.trim() || null;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate(
        "patient",
        "user dateOfBirth gender bloodType address allergies emergencyContact"
      )
      .populate(
        "doctor",
        "user licenseNumber specialization qualification experience consultationFee"
      )
      .populate(
        "department",
        "name description location"
      );

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    return res.status(500).json({
      message:
        "Failed to update appointment. Please try again later.",
    });
  }
};

// ADMIN - DELETE APPOINTMENT]

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    await appointment.deleteOne();

    return res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    return res.status(500).json({
      message:
        "Failed to delete appointment. Please try again later.",
    });
  }
};