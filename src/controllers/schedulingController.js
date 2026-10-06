import Session from "../models/Session.js";
import Client from "../models/Client.js";
import Availability from "../models/Availability.js";

// ==========================================
// GET ALL THERAPIST SESSIONS
// ==========================================
export const createSession = async (req, res) => {
  try {
    const {
      client,
      date,
      time,
      duration = 60,
      mode = "online",
      meetingLink = "",
    } = req.body;

    // -------------------------------
    // BASIC VALIDATION
    // -------------------------------
    if (!client || !date || !time) {
      return res.status(400).json({
        message: "Client, date and time are required",
      });
    }

    // -------------------------------
    // CREATE DATE IN IST
    // -------------------------------
    const sessionDate = new Date(
      `${date}T${time}:00+05:30`
    );

    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date or time",
      });
    }

    if (sessionDate <= new Date()) {
      return res.status(400).json({
        message: "Appointment must be in the future",
      });
    }

    // -------------------------------
    // CHECK CLIENT
    // -------------------------------
    const clientExists = await Client.findOne({
      _id: client,
      therapist: req.user.id,
    });

    if (!clientExists) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    // -------------------------------
    // CALCULATE DURATION
    // -------------------------------
    const appointmentDuration =
      Number(duration) || 60;

    const appointmentEnd = new Date(
      sessionDate.getTime() +
        appointmentDuration * 60 * 1000
    );

    // -------------------------------
    // DOUBLE BOOKING CHECK
    // -------------------------------
    const existingSessions = await Session.find({
      therapist: req.user.id,
      status: "scheduled",
    });

    const overlappingSession =
      existingSessions.find((existing) => {
        const existingStart =
          new Date(existing.date);

        const existingEnd = new Date(
          existingStart.getTime() +
            Number(existing.duration || 60) *
              60 *
              1000
        );

        return (
          sessionDate < existingEnd &&
          appointmentEnd > existingStart
        );
      });

    if (overlappingSession) {
      return res.status(409).json({
        message:
          "This time slot is already booked",
      });
    }

    // -------------------------------
    // CHECK THERAPIST AVAILABILITY
    // -------------------------------

    // Get the weekday in IST.
    // getUTCDay() works here because the
    // sessionDate was explicitly created
    // using +05:30.
    const dayOfWeek = sessionDate.getUTCDay();

    // Convert requested time to minutes.
    const [hours, minutes] =
      time.split(":").map(Number);

    const startMinutes =
      hours * 60 + minutes;

    const endMinutes =
      startMinutes + appointmentDuration;

    const endHours =
      Math.floor(endMinutes / 60);

    const endMins =
      endMinutes % 60;

    const requestedStartTime =
      `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

    const requestedEndTime =
      `${String(endHours).padStart(2, "0")}:${String(
        endMins
      ).padStart(2, "0")}`;

    const availableSlot =
      await Availability.findOne({
        therapist: req.user.id,
        dayOfWeek,
        isAvailable: true,
        startTime: {
          $lte: requestedStartTime,
        },
        endTime: {
          $gte: requestedEndTime,
        },
      });

    if (!availableSlot) {
      return res.status(400).json({
        message:
          "Therapist is not available at this time",
      });
    }

    // -------------------------------
    // CREATE SESSION
    // -------------------------------
    const session = await Session.create({
      therapist: req.user.id,
      client,
      date: sessionDate,
      duration: appointmentDuration,
      mode,
      status: "scheduled",
      meetingLink,
    });

    // -------------------------------
    // POPULATE SESSION
    // -------------------------------
    const populatedSession =
      await Session.findById(session._id)
        .populate(
          "client",
          "name email phone"
        )
        .populate(
          "therapist",
          "name email"
        );

    res.status(201).json({
      message:
        "Appointment created successfully",
      session: populatedSession,
    });
  } catch (error) {
    console.error(
      "Create session error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create appointment",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE SESSION
// ==========================================
export const updateSession = async (req, res) => {
  try {
    const session =
      await Session.findOneAndUpdate(
        {
          _id: req.params.id,
          therapist: req.user.id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "client",
        "name email phone"
      );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    console.error(
      "Update session error:",
      error
    );

    res.status(500).json({
      message: "Failed to update session",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SESSION
// ==========================================
export const deleteSession = async (req, res) => {
  try {
    const session =
      await Session.findOneAndDelete({
        _id: req.params.id,
        therapist: req.user.id,
      });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete session error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete session",
      error: error.message,
    });
  }
};

// ==========================================
// CANCEL SESSION
// ==========================================
export const cancelSession = async (req, res) => {
  try {
    const session =
      await Session.findOneAndUpdate(
        {
          _id: req.params.id,
          therapist: req.user.id,
        },
        {
          status: "cancelled",
        },
        {
          new: true,
        }
      );

    if (!session) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json({
      message:
        "Appointment cancelled successfully",
      session,
    });
  } catch (error) {
    console.error(
      "Cancel session error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to cancel appointment",
      error: error.message,
    });
  }
};

// ==========================================
// GET THERAPIST SESSIONS
// Alias for compatibility with existing routes
// ==========================================
// ==========================================
// GET ALL THERAPIST SESSIONS
// ==========================================
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      therapist: req.user.id,
    })
      .populate("client", "name email phone")
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);

    res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};

// ==========================================
// GET THERAPIST SESSIONS
// Alias for compatibility with existing routes
// ==========================================
export const getTherapistSessions = getSessions;


