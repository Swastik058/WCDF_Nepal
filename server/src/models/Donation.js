const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [0.01, "Donation amount must be greater than 0"]
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "khalti"
    },
    purpose: {
      type: String,
      trim: true,
      default: "General donation"
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    transactionId: {
      type: String,
      trim: true,
      default: null
    },
    // For Khalti Payment ID
    pidx: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Donation", donationSchema);
