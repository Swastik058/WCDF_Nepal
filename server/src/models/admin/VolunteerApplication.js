const mongoose = require("mongoose");

const volunteerApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
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
      required: [true, "Phone number is required"],
    },
    address: {
      type: String,
      trim: true,
      required: [true, "Address is required"],
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      trim: true,
      required: [true, "Availability is required"],
    },
    reasonForJoining: {
      type: String,
      trim: true,
      required: [true, "Reason for joining is required"],
      maxlength: [1500, "Reason for joining cannot exceed 1500 characters"],
    },
    previousExperience: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1500, "Previous experience cannot exceed 1500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    volunteerHours: {
      type: Number,
      min: [0, "Volunteer hours cannot be negative"],
      default: 0,
    },
    assignedEvents: {
      type: [
        {
          title: {
            type: String,
            trim: true,
          },
          location: {
            type: String,
            trim: true,
            default: "",
          },
          eventDate: {
            type: Date,
            default: null,
          },
          status: {
            type: String,
            enum: ["assigned", "ongoing", "completed"],
            default: "assigned",
          },
        },
      ],
      default: [],
    },
    recentActivity: {
      type: [
        {
          title: {
            type: String,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
            default: "",
          },
          activityDate: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Admin remarks cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VolunteerApplication", volunteerApplicationSchema);
