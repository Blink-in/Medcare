import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Admin gets hospital dashboard statistics
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

export default router;
