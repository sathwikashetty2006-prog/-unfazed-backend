import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getPackages,
  createPackage,
} from "../controllers/packageController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPackages);
router.post("/", createPackage);

export default router;
