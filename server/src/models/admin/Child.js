const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Child full name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    guardianName: {
      type: String,
      trim: true,
      default: "",
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    healthNotes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Health notes cannot exceed 1000 characters"],
    },
    educationLevel: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Child", childSchema);
