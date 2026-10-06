import mongoose from "mongoose";

import Client from "../models/Client.js";
import Session from "../models/Session.js";
import SessionNote from "../models/SessionNote.js";
import Payment from "../models/Payment.js";

export const getDashboardStats = async (req, res) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.user.id);

    const [clients, sessions, notes, revenue] =
      await Promise.all([
        Client.countDocuments({
          therapist: therapistId,
        }),

        Session.countDocuments({
          therapist: therapistId,
        }),

        SessionNote.countDocuments({
          therapist: therapistId,
        }),

        Payment.aggregate([
          {
            $match: {
              therapist: therapistId,
              status: "paid",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$amount",
              },
            },
          },
        ]),
      ]);

    res.json({
      clients,
      sessions,
      notes,
      revenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    console.error(
      "Dashboard statistics error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};