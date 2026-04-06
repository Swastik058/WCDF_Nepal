const mongoose = require("mongoose");

const generateSlug = (text) => {
  const base = String(text || "child")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);

  return `${base}-${Math.floor(Math.random() * 90000 + 10000)}`;
};

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
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    shortBio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Short bio cannot exceed 500 characters"],
    },
    interests: {
      type: [String],
      default: [],
    },
    joinedYear: {
      type: Number,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isPublished: {
      type: Boolean,
      default: false,
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

childSchema.pre("validate", function (next) {
  if (!this.slug || this.slug.trim().length === 0) {
    this.slug = generateSlug(this.fullName || this._id || Date.now());
  }
  next();
});

module.exports = mongoose.model("Child", childSchema);
