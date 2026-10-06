import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getDashboardStats,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/dashboard", getDashboardStats);

export default router;