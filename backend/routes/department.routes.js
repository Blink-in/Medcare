import express from "express";

import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
} from "../controllers/department.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();


// Admin only
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDepartment
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getDepartments
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getDepartment
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDepartment
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteDepartment
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  toggleDepartmentStatus
);

export default router;