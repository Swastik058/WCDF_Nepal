const Expense = require("../models/admin/Expense");
const ExpenseAuditLog = require("../models/admin/ExpenseAuditLog");
const Child = require("../models/admin/Child");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../middleware/receiptUploadMiddleware");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
  food: "Food",
  education: "Education",
  medical: "Medical",
  utilities: "Utilities",
  hostel_maintenance: "Hostel Maintenance",
  staff_salary: "Staff Salary",
  emergency: "Emergency",
  sponsorship_usage: "Sponsorship Usage",
  other: "Other",
};

const getClientIp = (req) =>
  (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").toString().split(",")[0].trim();

// Write one audit log entry
const writeAuditLog = async ({ expenseId, expenseTitle, action, user, details, snapshot, ip }) => {
  try {
    await ExpenseAuditLog.create({
      expenseId,
      expenseTitle: expenseTitle || "",
      action,
      performedBy: user._id,
      performedByName: user.name || "",
      performedByEmail: user.email || "",
      details: details || "",
      ipAddress: ip || "",
      snapshot: snapshot || null,
    });
  } catch (err) {
    // Never let audit log failure break a request
    console.error("[AuditLog] Failed to write:", err.message);
  }
};

// Build a safe expense snapshot for audit logs (no huge receipt blobs)
const buildSnapshot = (expense) => ({
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  expenseDate: expense.expenseDate,
  vendorName: expense.vendorName,
  receiptCount: expense.uploadedReceipts?.length || 0,
});

// ─── PUBLIC ENDPOINTS (no auth) ──────────────────────────────────────────────

/**
 * GET /api/expenses/public
 * Returns all published expenses for the transparency dashboard.
 * Supports: category, year, month, search, page, limit, sponsorship filters.
 */
exports.getPublicExpenses = async (req, res) => {
  try {
    const {
      category = "",
      year = "",
      month = "",
      search = "",
      sponsorship = "",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };

    if (category && Object.keys(CATEGORY_LABELS).includes(category)) {
      query.category = category;
    }

    if (sponsorship === "true") {
      query.category = "sponsorship_usage";
    }

    if (year || month) {
      const y = parseInt(year, 10) || new Date().getFullYear();
      const m = parseInt(month, 10);

      if (m && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        query.expenseDate = { $gte: start, $lte: end };
      } else if (year) {
        query.expenseDate = {
          $gte: new Date(y, 0, 1),
          $lte: new Date(y, 11, 31, 23, 59, 59, 999),
        };
      }
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { vendorName: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 50);
    const skip = (pageNum - 1) * pageSize;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("-__v")
        .populate("beneficiaryChild", "fullName name age image profileImage")
        .lean(),
      Expense.countDocuments(query),
    ]);

    return res.status(200).json({
      expenses,
      total,
      page: pageNum,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch public expenses" });
  }
};

/**
 * GET /api/expenses/public/analytics
 * Returns aggregate stats for the public transparency chart.
 */
exports.getPublicExpenseAnalytics = async (req, res) => {
  try {
    const match = { isPublished: true };

    const [totalResult, byCategory, monthly, sponsorshipTotal, recentExpenses] = await Promise.all([
      // Overall total
      Expense.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),

      // Category breakdown
      Expense.aggregate([
        { $match: match },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),

      // Monthly totals for last 12 months
      Expense.aggregate([
        {
          $match: {
            ...match,
            expenseDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Sponsorship usage total
      Expense.aggregate([
        { $match: { ...match, category: "sponsorship_usage" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // 5 most recent expenses
      Expense.find(match)
        .sort({ expenseDate: -1 })
        .limit(5)
        .select("title amount category expenseDate vendorName uploadedReceipts")
        .lean(),
    ]);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return res.status(200).json({
      totalAmount: totalResult[0]?.total || 0,
      totalCount: totalResult[0]?.count || 0,
      sponsorshipTotal: sponsorshipTotal[0]?.total || 0,
      byCategory: byCategory.map((c) => ({
        category: c._id,
        label: CATEGORY_LABELS[c._id] || c._id,
        total: c.total,
        count: c.count,
      })),
      monthly: monthly.map((m) => ({
        label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
        month: m._id.month,
        year: m._id.year,
        total: m.total,
        count: m.count,
      })),
      recentExpenses,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

/**
 * GET /api/expenses/public/:id
 * Single public expense detail.
 */
exports.getPublicExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, isPublished: true })
      .populate("beneficiaryChild", "fullName name age image profileImage isSponsored")
      .lean();

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    return res.status(200).json(expense);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense" });
  }
};

// ─── ADMIN ENDPOINTS (protected) ─────────────────────────────────────────────

/**
 * GET /api/expenses
 * Admin: all expenses with rich filters, pagination, populated fields.
 */
exports.getAdminExpenses = async (req, res) => {
  try {
    const {
      category = "",
      year = "",
      month = "",
      search = "",
      page = 1,
      limit = 20,
      sponsorship = "",
    } = req.query;

    const query = {};

    if (category && Object.keys(CATEGORY_LABELS).includes(category)) {
      query.category = category;
    }

    if (sponsorship === "true") {
      query.category = "sponsorship_usage";
    }

    if (year || month) {
      const y = parseInt(year, 10) || new Date().getFullYear();
      const m = parseInt(month, 10);
      if (m && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        query.expenseDate = { $gte: start, $lte: end };
      } else if (year) {
        query.expenseDate = {
          $gte: new Date(y, 0, 1),
          $lte: new Date(y, 11, 31, 23, 59, 59, 999),
        };
      }
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { vendorName: { $regex: search.trim(), $options: "i" } },
        { receiptNumber: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * pageSize;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("createdBy", "name email")
        .populate("beneficiaryChild", "fullName name age image profileImage isSponsored")
        .lean(),
      Expense.countDocuments(query),
    ]);

    return res.status(200).json({
      expenses,
      total,
      page: pageNum,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

/**
 * GET /api/expenses/:id
 * Admin: single expense with full details.
 */
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("beneficiaryChild", "fullName name age image profileImage isSponsored");

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    return res.status(200).json(expense);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch expense" });
  }
};

/**
 * POST /api/expenses
 * Admin: create a new expense (without receipts — uploaded separately).
 */
exports.createExpense = async (req, res) => {
  try {
    const {
      title,
      description = "",
      amount,
      category = "other",
      expenseDate,
      paymentMethod = "cash",
      beneficiaryChild = null,
      receiptNumber = "",
      vendorName = "",
      notes = "",
      isPublished = true,
    } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Amount must be greater than 0" });
    if (!expenseDate) return res.status(400).json({ message: "Expense date is required" });

    const expense = await Expense.create({
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      category,
      expenseDate: new Date(expenseDate),
      paymentMethod,
      beneficiaryChild: beneficiaryChild || null,
      receiptNumber: receiptNumber.trim(),
      vendorName: vendorName.trim(),
      notes: notes.trim(),
      isPublished: Boolean(isPublished),
      createdBy: req.user._id,
    });

    await writeAuditLog({
      expenseId: expense._id,
      expenseTitle: expense.title,
      action: "created",
      user: req.user,
      details: `Expense created: Rs. ${expense.amount} for ${CATEGORY_LABELS[expense.category] || expense.category}`,
      snapshot: buildSnapshot(expense),
      ip: getClientIp(req),
    });

    const populated = await Expense.findById(expense._id)
      .populate("createdBy", "name email")
      .populate("beneficiaryChild", "fullName name age");

    return res.status(201).json(populated);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0], errors: messages });
    }
    return res.status(500).json({ message: "Failed to create expense" });
  }
};

/**
 * PUT /api/expenses/:id
 * Admin: update expense details (not receipts).
 */
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const previousSnapshot = buildSnapshot(expense);

    const allowed = [
      "title", "description", "amount", "category", "expenseDate",
      "paymentMethod", "beneficiaryChild", "receiptNumber", "vendorName",
      "notes", "isPublished",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "amount") expense[field] = Number(req.body[field]);
        else if (field === "expenseDate") expense[field] = new Date(req.body[field]);
        else if (field === "isPublished") expense[field] = Boolean(req.body[field]);
        else if (field === "beneficiaryChild") expense[field] = req.body[field] || null;
        else expense[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    await expense.save();

    await writeAuditLog({
      expenseId: expense._id,
      expenseTitle: expense.title,
      action: "updated",
      user: req.user,
      details: `Expense updated. Previous: Rs. ${previousSnapshot.amount}, New: Rs. ${expense.amount}`,
      snapshot: { previous: previousSnapshot, updated: buildSnapshot(expense) },
      ip: getClientIp(req),
    });

    const populated = await Expense.findById(expense._id)
      .populate("createdBy", "name email")
      .populate("beneficiaryChild", "fullName name age image profileImage");

    return res.status(200).json(populated);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    return res.status(500).json({ message: "Failed to update expense" });
  }
};

/**
 * DELETE /api/expenses/:id
 * Admin: delete expense and all its Cloudinary receipts.
 */
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const snapshot = buildSnapshot(expense);
    const title = expense.title;

    // Clean up all Cloudinary receipts first
    if (expense.uploadedReceipts?.length) {
      await Promise.all(
        expense.uploadedReceipts.map((r) => deleteFromCloudinary(r.publicId, r.mimeType))
      );
    }

    await Expense.findByIdAndDelete(req.params.id);

    await writeAuditLog({
      expenseId: req.params.id,
      expenseTitle: title,
      action: "deleted",
      user: req.user,
      details: `Expense "${title}" (Rs. ${snapshot.amount}) permanently deleted`,
      snapshot,
      ip: getClientIp(req),
    });

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete expense" });
  }
};

/**
 * POST /api/expenses/:id/receipts
 * Admin: upload one or more receipt files to an existing expense.
 * Expects multipart/form-data with field name "receipts".
 */
exports.uploadReceipts = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    // Check total receipt cap (max 5 per expense)
    const remaining = 5 - (expense.uploadedReceipts?.length || 0);
    if (remaining <= 0) {
      return res.status(400).json({ message: "Maximum 5 receipts per expense already reached" });
    }

    const filesToUpload = req.files.slice(0, remaining);

    const uploaded = await Promise.all(
      filesToUpload.map(async (file) => {
        const result = await uploadBufferToCloudinary(file.buffer, file.mimetype);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname || "",
          fileType: file.mimetype.startsWith("image/") ? "image" : "raw",
          mimeType: file.mimetype,
          fileSize: file.size,
          uploadedAt: new Date(),
        };
      })
    );

    expense.uploadedReceipts.push(...uploaded);
    await expense.save();

    await writeAuditLog({
      expenseId: expense._id,
      expenseTitle: expense.title,
      action: "receipt_uploaded",
      user: req.user,
      details: `${uploaded.length} receipt(s) uploaded`,
      snapshot: { receiptCount: expense.uploadedReceipts.length },
      ip: getClientIp(req),
    });

    return res.status(200).json({
      message: `${uploaded.length} receipt(s) uploaded successfully`,
      uploadedReceipts: expense.uploadedReceipts,
    });
  } catch (err) {
    console.error("[Upload] Error:", err.message);
    return res.status(500).json({ message: "Failed to upload receipts: " + err.message });
  }
};

/**
 * DELETE /api/expenses/:id/receipts/:receiptId
 * Admin: remove a single receipt from an expense.
 */
exports.deleteReceipt = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const receiptIndex = expense.uploadedReceipts.findIndex(
      (r) => String(r._id) === String(req.params.receiptId)
    );

    if (receiptIndex === -1) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    const receipt = expense.uploadedReceipts[receiptIndex];

    // Delete from Cloudinary
    await deleteFromCloudinary(receipt.publicId, receipt.mimeType);

    expense.uploadedReceipts.splice(receiptIndex, 1);
    await expense.save();

    await writeAuditLog({
      expenseId: expense._id,
      expenseTitle: expense.title,
      action: "receipt_deleted",
      user: req.user,
      details: `Receipt "${receipt.originalName || receipt.publicId}" deleted`,
      snapshot: { receiptCount: expense.uploadedReceipts.length },
      ip: getClientIp(req),
    });

    return res.status(200).json({
      message: "Receipt deleted successfully",
      uploadedReceipts: expense.uploadedReceipts,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete receipt" });
  }
};

/**
 * GET /api/expenses/analytics
 * Admin analytics: totals, monthly, category breakdown, sponsorship stats.
 */
exports.getExpenseAnalytics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const y = parseInt(year, 10);

    const yearMatch = {
      expenseDate: {
        $gte: new Date(y, 0, 1),
        $lte: new Date(y, 11, 31, 23, 59, 59, 999),
      },
    };

    const [
      totalAll,
      totalYear,
      byCategory,
      monthlyYear,
      sponsorshipTotal,
      recentExpenses,
      yearList,
    ] = await Promise.all([
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      Expense.aggregate([{ $match: yearMatch }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      Expense.aggregate([
        { $match: yearMatch },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: yearMatch },
        {
          $group: {
            _id: { month: { $month: "$expenseDate" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]),
      Expense.aggregate([
        { $match: { category: "sponsorship_usage" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.find()
        .sort({ expenseDate: -1 })
        .limit(5)
        .select("title amount category expenseDate vendorName uploadedReceipts beneficiaryChild")
        .populate("beneficiaryChild", "fullName name")
        .lean(),
      Expense.aggregate([
        { $group: { _id: { $year: "$expenseDate" } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Fill all 12 months (0 for missing months)
    const monthlyMap = new Map(monthlyYear.map((m) => [m._id.month, m]));
    const monthly = MONTH_NAMES.map((name, i) => {
      const data = monthlyMap.get(i + 1);
      return { label: name, month: i + 1, total: data?.total || 0, count: data?.count || 0 };
    });

    return res.status(200).json({
      totalAllTime: totalAll[0]?.total || 0,
      countAllTime: totalAll[0]?.count || 0,
      totalYear: totalYear[0]?.total || 0,
      countYear: totalYear[0]?.count || 0,
      sponsorshipTotal: sponsorshipTotal[0]?.total || 0,
      sponsorshipCount: sponsorshipTotal[0]?.count || 0,
      byCategory: byCategory.map((c) => ({
        category: c._id,
        label: CATEGORY_LABELS[c._id] || c._id,
        total: c.total,
        count: c.count,
      })),
      monthly,
      recentExpenses,
      availableYears: yearList.map((y) => y._id).filter(Boolean),
      selectedYear: y,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

/**
 * GET /api/expenses/sponsorship
 * Admin: all sponsorship_usage expenses with child details.
 */
exports.getSponsorshipExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ category: "sponsorship_usage" })
      .sort({ expenseDate: -1 })
      .populate("beneficiaryChild", "fullName name age image profileImage isSponsored sponsoredBy")
      .populate("createdBy", "name email")
      .lean();

    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return res.status(200).json({ expenses, total });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch sponsorship expenses" });
  }
};

/**
 * GET /api/expenses/audit-logs
 * Admin: full audit trail with optional filters.
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { expenseId = "", action = "", page = 1, limit = 30 } = req.query;

    const query = {};
    if (expenseId) query.expenseId = expenseId;
    if (action && ["created", "updated", "deleted", "receipt_uploaded", "receipt_deleted"].includes(action)) {
      query.action = action;
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 30, 1), 100);
    const skip = (pageNum - 1) * pageSize;

    const [logs, total] = await Promise.all([
      ExpenseAuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("performedBy", "name email")
        .lean(),
      ExpenseAuditLog.countDocuments(query),
    ]);

    return res.status(200).json({
      logs,
      total,
      page: pageNum,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
