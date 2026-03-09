const mongoose = require("mongoose");

const volunteerApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      trim: true,
      default: "",
    },
    motivation: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1500, "Motivation cannot exceed 1500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Review note cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VolunteerApplication", volunteerApplicationSchema);
