import Therapist from "../models/Therapist.js";

// Create a URL-friendly slug
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Generate a unique slug
const generateUniqueSlug = async (name, therapistId) => {
  let baseSlug = createSlug(name);

  if (!baseSlug) {
    baseSlug = "therapist";
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingTherapist = await Therapist.findOne({
      slug: slug,
      _id: { $ne: therapistId },
    });

    if (!existingTherapist) {
      return slug;
    }

    slug = baseSlug + "-" + counter;
    counter++;
  }
};

// GET MY PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const therapist = await Therapist.findById(
      req.user.id
    ).select("-password_hash");

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    res.json(therapist);
  } catch (error) {
    console.error("Get therapist profile error:", error);

    res.status(500).json({
      message: "Failed to get therapist profile",
      error: error.message,
    });
  }
};

// UPDATE MY PROFILE
export const updateMyProfile = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.user.id);

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    const {
      name,
      phone,
      qualification,
      experience,
      bio,
      specializations,
      languages,
    } = req.body;

    if (name !== undefined) {
      therapist.name = name;
    }

    if (phone !== undefined) {
      therapist.phone = phone;
    }

    if (qualification !== undefined) {
      therapist.qualification = qualification;
    }

    if (experience !== undefined) {
      therapist.experience = Number(experience);
    }

    if (bio !== undefined) {
      therapist.bio = bio;
    }

    if (specializations !== undefined) {
      therapist.specializations = Array.isArray(
        specializations
      )
        ? specializations
        : [];
    }

    if (languages !== undefined) {
      therapist.languages = Array.isArray(languages)
        ? languages
        : [];
    }

    // Create a slug if there isn't one,
    // or regenerate it when the name changes.
    if (!therapist.slug || name !== undefined) {
      therapist.slug = await generateUniqueSlug(
        therapist.name,
        therapist._id
      );
    }

    await therapist.save();

    const safeTherapist = await Therapist.findById(
      therapist._id
    ).select("-password_hash");

    res.json({
      message: "Profile updated successfully",
      therapist: safeTherapist,
    });
  } catch (error) {
    console.error(
      "Update therapist profile error:",
      error
    );

    res.status(500).json({
      message: "Failed to update therapist profile",
      error: error.message,
    });
  }
};

// GET PUBLIC THERAPIST PROFILE
export const getPublicProfile = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select(
      "name slug bio phone qualification experience specializations languages"
    );

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist profile not found",
      });
    }

    res.json(therapist);
  } catch (error) {
    console.error(
      "Get public profile error:",
      error
    );

    res.status(500).json({
      message: "Failed to get public profile",
      error: error.message,
    });
  }
};
export const getAllTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find({
      isActive: true,
    }).select(
      "name email phone qualification experience bio specializations languages slug"
    );

    res.json(therapists);
  } catch (error) {
    console.error("Get all therapists error:", error);

    res.status(500).json({
      message: "Failed to fetch therapists",
      error: error.message,
    });
  }
};
