import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  getAllTherapists,
} from "../controllers/therapistController.js";

const router = express.Router();

// Public therapist profile
router.get("/public/:slug", getPublicProfile);
router.get("/", authMiddleware, getAllTherapists);

// Protected therapist profile
router.get(
  "/profile",
  authMiddleware,
  getMyProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateMyProfile
);

export default router;

