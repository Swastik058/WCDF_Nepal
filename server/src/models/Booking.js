const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
  },
  phone: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, "Date is required"]
  },
  time: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true,
    default: "General visit"
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { 
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);

