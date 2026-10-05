import express from "express";

import {
  createPrescription,
  getMyPrescriptions,
  getMyDoctorPrescriptions,
  getPrescription,
  updatePrescription,
  getPrescriptions,
  deletePrescription,
} from "../controllers/prescription.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Doctor routes

// Doctor creates a prescription
router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  createPrescription
);

// Doctor gets prescriptions they created
router.get(
  "/doctor/me",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorPrescriptions
);

// Patient routes

// Patient gets their own prescriptions
router.get(
  "/me",
  protect,
  authorizeRoles("patient"),
  getMyPrescriptions
);

// Admin routes

// Admin gets all prescriptions
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getPrescriptions
);

// Admin deletes a prescription
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deletePrescription
);

// Shared routes

// Admin, doctor, or patient gets one prescription
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor", "patient"),
  getPrescription
);

// Admin or doctor updates a prescription
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updatePrescription
);

export default router;
