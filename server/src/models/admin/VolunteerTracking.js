const mongoose = require("mongoose");

const volunteerTrackingSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participationStatus: {
      type: String,
      enum: ["assigned", "attended", "missed", "completed"],
      default: "assigned",
    },
    hoursCompleted: {
      type: Number,
      min: 0,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

volunteerTrackingSchema.index({ volunteerId: 1, activityId: 1 }, { unique: true });

module.exports = mongoose.model("VolunteerTracking", volunteerTrackingSchema);
