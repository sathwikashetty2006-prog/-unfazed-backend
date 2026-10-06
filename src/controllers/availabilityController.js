import Availability from "../models/Availability.js";

// Get therapist availability
export const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      therapist: req.user.id,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    res.json(availability);
  } catch (error) {
    console.error("Get availability error:", error);

    res.status(500).json({
      message: "Failed to get availability",
      error: error.message,
    });
  }
};

// Create availability
export const createAvailability = async (req, res) => {
  try {
    const {
      dayOfWeek,
      startTime,
      endTime,
    } = req.body;

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message:
          "dayOfWeek, startTime and endTime are required",
      });
    }

    if (
      Number(dayOfWeek) < 0 ||
      Number(dayOfWeek) > 6
    ) {
      return res.status(400).json({
        message: "dayOfWeek must be between 0 and 6",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message:
          "End time must be later than start time",
      });
    }

    const existing = await Availability.findOne({
      therapist: req.user.id,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      isAvailable: true,
    });

    if (existing) {
      return res.status(400).json({
        message: "This availability already exists",
      });
    }

    const availability =
      await Availability.create({
        therapist: req.user.id,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        isAvailable: true,
      });

    res.status(201).json({
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    console.error(
      "Create availability error:",
      error
    );

    res.status(500).json({
      message: "Failed to create availability",
      error: error.message,
    });
  }
};

// Delete availability
export const deleteAvailability = async (
  req,
  res
) => {
  try {
    const availability =
      await Availability.findOneAndDelete({
        _id: req.params.id,
        therapist: req.user.id,
      });

    if (!availability) {
      return res.status(404).json({
        message: "Availability not found",
      });
    }

    res.json({
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete availability error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete availability",
      error: error.message,
    });
  }
};

