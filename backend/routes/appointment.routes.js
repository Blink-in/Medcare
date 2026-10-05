import express from "express";

import {
  createAppointment,
  getMyAppointments,
  getMyDoctorAppointments,
  getAppointment,
  cancelMyAppointment,
  updateAppointmentStatus,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();


// PATIENT ROUTES


// Book an appointment
router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  createAppointment
);

// Get logged-in patient's appointments
router.get(
  "/me",
  protect,
  authorizeRoles("patient"),
  getMyAppointments
);

// Cancel logged-in patient's own appointment
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("patient"),
  cancelMyAppointment
);


// DOCTOR ROUTES


// Get logged-in doctor's appointments
router.get(
  "/doctor/me",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorAppointments
);

// Doctor updates appointment status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("doctor", "admin"),
  updateAppointmentStatus
);


// ADMIN ROUTES


// Get all appointments
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAppointments
);

// Update an appointment
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateAppointment
);

// Delete an appointment
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteAppointment
);


// SHARED ROUTE


// Get one appointment
// Access is restricted inside the controller:
// admin -> any appointment
// doctor -> own appointments
// patient -> own appointments
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor", "patient"),
  getAppointment
);

export default router;