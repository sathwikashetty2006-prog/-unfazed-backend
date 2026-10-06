import mongoose from "mongoose";

const subscriptionTierConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    price: {
      type: Number,
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
    },

    features: {
      type: [String],
      default: [],
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

export default mongoose.model(
  "SubscriptionTierConfig",
  subscriptionTierConfigSchema
);

