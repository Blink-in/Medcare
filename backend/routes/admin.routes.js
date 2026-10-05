import express from "express";

import { createStaffUser } from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ADMIN ONLY
router.post(
  "/users",
  protect,
  authorizeRoles("admin"),
  createStaffUser
);

export default router;