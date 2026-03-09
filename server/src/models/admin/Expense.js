const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["food", "medical", "education", "utility", "event", "salary", "other"],
      default: "other",
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0.01, "Expense amount must be greater than 0"],
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense date is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "esewa", "khalti", "other"],
      default: "cash",
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
