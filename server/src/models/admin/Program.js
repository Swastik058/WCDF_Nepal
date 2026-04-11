const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Program title is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    shortDescription: {
      type: String,
      trim: true,
      required: [true, "Short description is required"],
      maxlength: [240, "Short description cannot exceed 240 characters"],
    },
    fullDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Full description cannot exceed 5000 characters"],
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", programSchema);
