import mongoose from "mongoose";

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password_hash: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    qualification: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    // PDF requirement:
    // specializations[]
    specializations: {
      type: [String],
      default: [],
    },

    // PDF requirement:
    // languages[]
    languages: {
      type: [String],
      default: [],
    },

    // Public branded profile URL
    // Example: /dr-sharma
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Therapist", therapistSchema);

