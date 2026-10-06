import Session from "../models/Session.js";
import Client from "../models/Client.js";
import Therapist from "../models/Therapist.js";
import Availability from "../models/Availability.js";

// ==========================================
// GET THERAPIST + AVAILABILITY
// ==========================================
export const getTherapistAvailability = async (
  req,
  res
) => {
  try {
    const { therapistId } = req.params;

    const therapist = await Therapist.findById(
      therapistId
    ).select(
      "name email phone qualification experience bio"
    );

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    const availability = await Availability.find({
      therapist: therapistId,
      isAvailable: true,
    }).sort({
      dayOfWeek: 1,
      startTime: 1,
    });

    res.json({
      therapist,
      availability,
    });
  } catch (error) {
    console.error(
      "Get therapist availability error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load therapist availability",
      error: error.message,
    });
  }
};

// ==========================================
// CLIENT BOOKS APPOINTMENT
// ==========================================

export const bookAppointment = async (req, res) => {
  try {
    const clientId = req.user.id;

    const {
      therapist,
      date,
      duration = 60,
      mode = "online",
    } = req.body;

    if (!therapist || !date) {
      return res.status(400).json({
        message:
          "Therapist and appointment date are required",
      });
    }

    // Frontend sends: YYYY-MM-DDTHH:mm
    // Treat it as Indian Standard Time.
    const appointmentDate = new Date(
      `${date}:00+05:30`
    );

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        message:
          "Appointment must be scheduled for a future time",
      });
    }

    // ==========================================
    // CHECK CLIENT
    // ==========================================

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    // ==========================================
    // CHECK THERAPIST
    // ==========================================

    const therapistExists =
      await Therapist.findById(therapist);

    if (!therapistExists) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    const appointmentDuration =
      Number(duration) || 60;

    const appointmentEnd = new Date(
      appointmentDate.getTime() +
        appointmentDuration * 60 * 1000
    );

    // ==========================================
    // CHECK THERAPIST AVAILABILITY
    // ==========================================

    // appointmentDate is stored as UTC,
    // so use UTC weekday for the IST date.
    const dayOfWeek =
      appointmentDate.getUTCDay();

    const [hours, minutes] =
      date.split("T")[1].split(":").map(Number);

    const startMinutes =
      hours * 60 + minutes;

    const endMinutes =
      startMinutes + appointmentDuration;

    const endHours =
      Math.floor(endMinutes / 60);

    const endMins =
      endMinutes % 60;

    const startTime =
      `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

    const endTime =
      `${String(endHours).padStart(2, "0")}:${String(
        endMins
      ).padStart(2, "0")}`;

    const availableSlot =
      await Availability.findOne({
        therapist,
        dayOfWeek,
        isAvailable: true,
        startTime: {
          $lte: startTime,
        },
        endTime: {
          $gte: endTime,
        },
      });

    if (!availableSlot) {
      return res.status(400).json({
        message:
          "Therapist is not available at this time",
      });
    }

    // ==========================================
    // CHECK DOUBLE BOOKING
    // ==========================================

    const existingSessions =
      await Session.find({
        therapist,
        status: "scheduled",
      });

    const overlapping =
      existingSessions.find((session) => {
        const existingStart =
          new Date(session.date);

        const existingEnd = new Date(
          existingStart.getTime() +
            Number(session.duration || 60) *
              60 *
              1000
        );

        return (
          appointmentDate < existingEnd &&
          appointmentEnd > existingStart
        );
      });

    if (overlapping) {
      return res.status(409).json({
        message:
          "This appointment time is already booked",
      });
    }

    // ==========================================
    // CREATE SESSION
    // ==========================================

    const session = await Session.create({
      therapist,
      client: clientId,
      date: appointmentDate,
      duration: appointmentDuration,
      mode,
      status: "scheduled",
    });

    // ==========================================
    // RETURN POPULATED SESSION
    // ==========================================

    const populatedSession =
      await Session.findById(session._id)
        .populate(
          "therapist",
          "name email phone qualification experience bio"
        )
        .populate(
          "client",
          "name email phone"
        );

    res.status(201).json({
      message:
        "Appointment booked successfully",
      session: populatedSession,
    });
  } catch (error) {
    console.error(
      "Book appointment error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to book appointment",
      error: error.message,
    });
  }
};
// ==========================================
// GET CLIENT APPOINTMENTS
// ==========================================
export const getClientAppointments = async (
  req,
  res
) => {
  try {
    const sessions = await Session.find({
      client: req.user.id,
    })
      .populate(
        "therapist",
        "name email phone qualification experience bio"
      )
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    console.error(
      "Get client appointments error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch your appointments",
      error: error.message,
    });
  }
};

