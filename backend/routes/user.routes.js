import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();



router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getUsers
);


router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getUser
);


router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateUser
);


router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);


router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  toggleUserStatus
);

router.patch(
  "/:id/role",
  protect,
  authorizeRoles("admin"),
  updateUserRole
);

export default router;