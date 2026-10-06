import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getTherapistAvailability,
  bookAppointment,
  getClientAppointments,
} from "../controllers/clientBookingController.js";

const router = express.Router();

router.use(authMiddleware);

// View a therapist's availability
router.get(
  "/therapist/:therapistId",
  getTherapistAvailability
);

// Client books appointment
router.post(
  "/book",
  bookAppointment
);

// Client's appointments
router.get(
  "/my-appointments",
  getClientAppointments
);

export default router;

