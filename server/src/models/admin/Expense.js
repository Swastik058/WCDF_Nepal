const mongoose = require("mongoose");

// Sub-schema for each uploaded receipt/invoice
const receiptSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id for deletion
    originalName: { type: String, default: "" },
    fileType: { type: String, default: "" },    // "image" or "raw" (pdf)
    mimeType: { type: String, default: "" },    // exact mime type
    fileSize: { type: Number, default: 0 },     // bytes
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0.01, "Expense amount must be greater than 0"],
    },
    category: {
      type: String,
      enum: [
        "food",
        "education",
        "medical",
        "utilities",
        "hostel_maintenance",
        "staff_salary",
        "emergency",
        "sponsorship_usage",
        "other",
      ],
      default: "other",
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense date is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "esewa", "khalti", "cheque", "other"],
      default: "cash",
    },
    // Optional: link to a sponsored child (for sponsorship tracking)
    beneficiaryChild: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      default: null,
    },
    uploadedReceipts: {
      type: [receiptSchema],
      default: [],
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: "",
    },
    vendorName: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // All expenses are publicly visible by default for transparency
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast analytics and filtering queries
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ beneficiaryChild: 1 });
expenseSchema.index({ createdAt: -1 });
expenseSchema.index({ isPublished: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
