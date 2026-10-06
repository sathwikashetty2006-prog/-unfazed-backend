import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    sessions: {
      type: Number,
      enum: [3, 6, 12],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    perSessionRate: {
      type: Number,
      required: true,
    },

    expiryDays: {
      type: Number,
      default: 30,
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

export default mongoose.model("Package", packageSchema);

