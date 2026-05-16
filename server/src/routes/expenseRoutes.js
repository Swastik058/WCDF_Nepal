const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  receiptUpload,
  requireCloudinaryConfig,
} = require("../middleware/receiptUploadMiddleware");
const {
  getPublicExpenses,
  getPublicExpenseAnalytics,
  getPublicExpenseById,
  getAdminExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipts,
  deleteReceipt,
  getExpenseAnalytics,
  getSponsorshipExpenses,
  getAuditLogs,
} = require("../controllers/expenseController");

// ─── PUBLIC ROUTES (no authentication required) ───────────────────────────────
router.get("/public/analytics", getPublicExpenseAnalytics);
router.get("/public/:id", getPublicExpenseById);
router.get("/public", getPublicExpenses);

// ─── ADMIN ROUTES (JWT + admin role required) ─────────────────────────────────
router.use(protect, adminOnly);

router.get("/analytics", getExpenseAnalytics);
router.get("/sponsorship", getSponsorshipExpenses);
router.get("/audit-logs", getAuditLogs);
router.get("/", getAdminExpenses);
router.post("/", createExpense);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

// Receipt management
router.post(
  "/:id/receipts",
  requireCloudinaryConfig,
  receiptUpload.array("receipts", 5),
  uploadReceipts
);
router.delete("/:id/receipts/:receiptId", deleteReceipt);

module.exports = router;
