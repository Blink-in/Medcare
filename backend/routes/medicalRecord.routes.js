import express from "express";

import {
  createMedicalRecord,
  getMyMedicalRecords,
  getMyDoctorMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
  getMedicalRecords,
  deleteMedicalRecord,
} from "../controllers/medicalRecord.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Doctor routes
router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  createMedicalRecord
);

router.get(
  "/doctor/me",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorMedicalRecords
);

// Patient routes
router.get(
  "/me",
  protect,
  authorizeRoles("patient"),
  getMyMedicalRecords
);

// Admin routes
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getMedicalRecords
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteMedicalRecord
);

// Shared routes with ownership checks handled by the controller
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor", "patient"),
  getMedicalRecord
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updateMedicalRecord
);

export default router;