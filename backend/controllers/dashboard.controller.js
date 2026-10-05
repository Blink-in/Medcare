import User from "../models/userModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Department from "../models/departmentModel.js";
import Appointment from "../models/appointmentModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";
import Prescription from "../models/prescriptionModel.js";

// Get hospital dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get the main record counts
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      totalMedicalRecords,
      totalPrescriptions,
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Department.countDocuments(),
      Appointment.countDocuments(),
      MedicalRecord.countDocuments(),
      Prescription.countDocuments(),
    ]);

    // Get appointment counts by status
    const [
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
    ]);

    // Get active and inactive user counts
    const activeUsers = await User.countDocuments({
      isActive: true,
    });

    const inactiveUsers = await User.countDocuments({
      isActive: false,
    });

    // Get active and inactive doctor counts
    const activeDoctors = await Doctor.countDocuments({
      isActive: true,
    });

    const inactiveDoctors = await Doctor.countDocuments({
      isActive: false,
    });

    // Get active and inactive department counts
    const activeDepartments = await Department.countDocuments({
      isActive: true,
    });

    const inactiveDepartments = await Department.countDocuments({
      isActive: false,
    });

    return res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },

        patients: {
          total: totalPatients,
        },

        doctors: {
          total: totalDoctors,
          active: activeDoctors,
          inactive: inactiveDoctors,
        },

        departments: {
          total: totalDepartments,
          active: activeDepartments,
          inactive: inactiveDepartments,
        },

        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },

        medicalRecords: {
          total: totalMedicalRecords,
        },

        prescriptions: {
          total: totalPrescriptions,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard statistics error:", error);

    return res.status(500).json({
      message: "Failed to retrieve dashboard statistics",
    });
  }
};
