import express from "express";

import {
  createDoctor,
  getDoctors,
  getDoctor,
  getMyDoctorProfile,
  updateDoctor,
  updateMyDoctorProfile,
  toggleDoctorStatus,
  verifyDoctor,
} from "../controllers/doctor.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// DOCTOR SELF-SERVICE ROUTES
// These must come before /:id routes.

router.get(
  "/me/profile",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorProfile
);

router.put(
  "/me/profile",
  protect,
  authorizeRoles("doctor"),
  updateMyDoctorProfile
);

// ADMIN ROUTES

// Create doctor
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);

// Get all doctors
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getDoctors
);

// Get single doctor
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getDoctor
);

// Update doctor
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDoctor
);

// Toggle doctor active status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  toggleDoctorStatus
);

// Verify/unverify doctor
router.patch(
  "/:id/verify",
  protect,
  authorizeRoles("admin"),
  verifyDoctor
);

export default router;