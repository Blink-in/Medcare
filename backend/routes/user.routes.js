
import express from "express";

import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
  getTrashedUsers,
  restoreUser,
  permanentlyDeleteUser,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/trash", getTrashedUsers);
router.patch("/trash/:id/restore", restoreUser);
router.delete("/trash/:id/permanent", permanentlyDeleteUser);

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/status", toggleUserStatus);
router.patch("/:id/role", updateUserRole);

export default router;
