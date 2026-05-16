const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    expenseTitle: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      enum: ["created", "updated", "deleted", "receipt_uploaded", "receipt_deleted"],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performedByName: {
      type: String,
      default: "",
    },
    performedByEmail: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    // Snapshot of key expense fields at the time of the action
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ expenseId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model("ExpenseAuditLog", auditLogSchema);
