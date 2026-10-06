import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getAvailability,
  createAvailability,
  deleteAvailability,
} from "../controllers/availabilityController.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getAvailability
);

router.post(
  "/",
  authMiddleware,
  createAvailability
);

router.delete(
  "/:id",
  authMiddleware,
  deleteAvailability
);

export default router;

