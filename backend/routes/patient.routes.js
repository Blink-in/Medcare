import express from "express";

import {
  createPatient,
  getPatients,
  getPatient,
  getMyPatientProfile,
  updatePatient,
  updateMyPatientProfile,
  deletePatient,
} from "../controllers/patient.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// PATIENT SELF SERVICE ROUTES

// Get my patient profile
// Must come before /:id
router.get(
  "/me/profile",
  protect,
  authorizeRoles("patient"),
  getMyPatientProfile
);

// Update my patient profile
router.put(
  "/me/profile",
  protect,
  authorizeRoles("patient"),
  updateMyPatientProfile
);


// ADMIN ROUTES

// Create patient profile
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createPatient
);

// Get all patients
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getPatients
);

// Get single patient
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getPatient
);

// Update patient
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updatePatient
);

// Delete patient profile
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deletePatient
);

export default router;