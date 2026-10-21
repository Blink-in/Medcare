import express from "express";

import {
createDoctor,
getDoctors,
getPublicDoctors,
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

// Public directory: deliberately excludes private contact and licensing details.
router.get("/public", getPublicDoctors);

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

router.get(
"/",
protect,
authorizeRoles("admin", "doctor", "patient"),
getDoctors
);

router.post(
"/",
protect,
authorizeRoles("admin"),
createDoctor
);

router.get(
"/:id",
protect,
authorizeRoles("admin"),
getDoctor
);

router.put(
"/:id",
protect,
authorizeRoles("admin"),
updateDoctor
);

router.patch(
"/:id/status",
protect,
authorizeRoles("admin"),
toggleDoctorStatus
);

router.patch(
"/:id/verify",
protect,
authorizeRoles("admin"),
verifyDoctor
);

export default router;
