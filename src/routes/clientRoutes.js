import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getMyProfile,
  updateMyProfile,
} from "../controllers/clientController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getClients);
router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile);
router.get("/:id", getClient);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;

