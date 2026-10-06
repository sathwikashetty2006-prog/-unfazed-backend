import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../controllers/schedulingController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getSessions);
router.post("/", createSession);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

export default router;