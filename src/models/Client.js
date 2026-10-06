import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      default: null,
    },

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
    },

    intakeCompleted: {
      type: Boolean,
      default: false,
    },

    intake: {
      age: Number,
      gender: String,
      occupation: String,
      presentingConcern: String,
      medicalHistory: String,
      therapyHistory: String,
      additionalInformation: String,
    },

    consentGiven: {
      type: Boolean,
      default: false,
    },

    consentTimestamp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", clientSchema);

