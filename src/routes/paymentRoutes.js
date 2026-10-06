import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getPayments,
  createPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPayments);
router.post("/", createPayment);

export default router;