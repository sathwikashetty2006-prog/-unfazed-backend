import Package from "../models/Package.js";

export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({
      therapist: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(packages);
  } catch (error) {
    console.error("Get packages error:", error);

    res.status(500).json({
      message: "Failed to fetch packages",
      error: error.message,
    });
  }
};

export const createPackage = async (req, res) => {
  try {
    const {
      name,
      sessions,
      price,
      expiryDays,
    } = req.body;

    if (!name || !sessions || !price || !expiryDays) {
      return res.status(400).json({
        message:
          "Name, sessions, price and expiry days are required",
      });
    }

    const perSessionRate =
      Number(price) / Number(sessions);

    const newPackage = await Package.create({
      therapist: req.user.id,
      name,
      sessions: Number(sessions),
      price: Number(price),
      perSessionRate,
      expiryDays: Number(expiryDays),
      isActive: true,
    });

    res.status(201).json({
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error("Create package error:", error);

    res.status(500).json({
      message: "Failed to create package",
      error: error.message,
    });
  }
};

