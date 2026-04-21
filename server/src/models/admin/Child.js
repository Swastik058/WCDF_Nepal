const mongoose = require("mongoose");

const costBreakdownSchema = new mongoose.Schema(
  {
    education: {
      type: Number,
      default: 0,
      min: [0, "Education cost cannot be negative"],
    },
    food: {
      type: Number,
      default: 0,
      min: [0, "Food cost cannot be negative"],
    },
    healthcare: {
      type: Number,
      default: 0,
      min: [0, "Healthcare cost cannot be negative"],
    },
    shelter: {
      type: Number,
      default: 0,
      min: [0, "Shelter cost cannot be negative"],
    },
    others: {
      type: Number,
      default: 0,
      min: [0, "Other cost cannot be negative"],
    },
  },
  { _id: false }
);

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
    name: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      required: [true, "Child full name is required"],
      trim: true,
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      default: null,
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
    image: {
      type: String,
      trim: true,
      default: "",
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1500, "Description cannot exceed 1500 characters"],
    },
    shortBio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Short bio cannot exceed 500 characters"],
    },
    yearlyCost: {
      type: Number,
      default: 0,
      min: [0, "Yearly cost cannot be negative"],
    },
    costBreakdown: {
      type: costBreakdownSchema,
      default: () => ({
        education: 0,
        food: 0,
        healthcare: 0,
        shelter: 0,
        others: 0,
      }),
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    sponsoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
  const resolvedName = this.name?.trim() || this.fullName?.trim();
  if (resolvedName) {
    this.name = resolvedName;
    this.fullName = resolvedName;
  }

  const resolvedImage = this.image?.trim() || this.profileImage?.trim();
  this.image = resolvedImage || "";
  this.profileImage = resolvedImage || "";

  const resolvedDescription = this.description?.trim() || this.shortBio?.trim();
  this.description = resolvedDescription || "";
  this.shortBio = resolvedDescription || "";

  if (this.dateOfBirth) {
    const today = new Date();
    let derivedAge = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - this.dateOfBirth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < this.dateOfBirth.getDate())
    ) {
      derivedAge -= 1;
    }

    this.age = Math.max(0, derivedAge);
  }

  if (!this.isSponsored) {
    this.sponsoredBy = null;
  }

  if (!this.slug || this.slug.trim().length === 0) {
    this.slug = generateSlug(this.name || this.fullName || this._id || Date.now());
  }
  next();
});

module.exports = mongoose.model("Child", childSchema);
