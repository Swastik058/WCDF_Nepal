const mongoose = require("mongoose");
const Child = require("../../models/admin/Child");
const Event = require("../../models/admin/Event");
const Expense = require("../../models/admin/Expense");
const VolunteerApplication = require("../../models/admin/VolunteerApplication");
const Donation = require("../../models/Donation");
const BlockchainTransaction = require("../../models/admin/BlockchainTransaction");

const badRequest = (res, message) => res.status(400).json({ message });

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const formatValidationError = (error) => {
  if (error?.name !== "ValidationError") {
    return null;
  }

  const errors = {};
  Object.keys(error.errors).forEach((key) => {
    errors[key] = error.errors[key].message;
  });

  return errors;
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      donationSummary,
      totalChildren,
      totalEvents,
      expenseSummary,
      totalVolunteers,
      pendingVolunteerApprovals,
      recentDonations,
      pendingVolunteerList,
      recentEvents,
      recentExpenses,
      recentVolunteerUpdates,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Child.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      VolunteerApplication.countDocuments({ status: "approved" }),
      VolunteerApplication.countDocuments({ status: "pending" }),
      Donation.find({ status: "completed" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("donorName amount email status createdAt purpose"),
      VolunteerApplication.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email phone createdAt"),
      Event.find().sort({ createdAt: -1 }).limit(5).select("title status eventDate createdAt"),
      Expense.find().sort({ createdAt: -1 }).limit(5).select("title amount category createdAt"),
      VolunteerApplication.find({ status: { $in: ["approved", "rejected"] } })
        .sort({ reviewedAt: -1 })
        .limit(5)
        .select("fullName status reviewedAt"),
    ]);

    const totalDonations = donationSummary[0]?.total || 0;
    const totalExpenses = expenseSummary[0]?.total || 0;

    const recentActivity = [
      ...recentDonations.map((donation) => ({
        type: "donation",
        title: `Donation from ${donation.donorName}`,
        meta: `${donation.amount} (${donation.purpose || "General donation"})`,
        createdAt: donation.createdAt,
      })),
      ...recentEvents.map((event) => ({
        type: "event",
        title: `Event: ${event.title}`,
        meta: `${event.status} - ${new Date(event.eventDate).toLocaleDateString()}`,
        createdAt: event.createdAt,
      })),
      ...recentExpenses.map((expense) => ({
        type: "expense",
        title: `Expense: ${expense.title}`,
        meta: `${expense.amount} (${expense.category})`,
        createdAt: expense.createdAt,
      })),
      ...recentVolunteerUpdates.map((item) => ({
        type: "volunteer",
        title: `Volunteer ${item.status}: ${item.fullName}`,
        meta: "Application reviewed",
        createdAt: item.reviewedAt,
      })),
    ]
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return res.status(200).json({
      cards: {
        totalDonations,
        totalVolunteers,
        totalChildren,
        totalEvents,
        totalExpenses,
      },
      recentDonations,
      pendingVolunteerApprovals,
      pendingVolunteerList,
      recentActivity,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard summary" });
  }
};

exports.getChildren = async (req, res) => {
  try {
    const children = await Child.find().sort({ createdAt: -1 });
    return res.status(200).json(children);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch children" });
  }
};

exports.createChild = async (req, res) => {
  try {
    const { fullName, dateOfBirth } = req.body;

    if (!fullName || !dateOfBirth) {
      return badRequest(res, "fullName and dateOfBirth are required");
    }

    const child = await Child.create(req.body);
    return res.status(201).json(child);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to create child" });
  }
};

exports.updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await Child.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    return res.status(200).json(child);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to update child" });
  }
};

exports.deleteChild = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await Child.findByIdAndDelete(id);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    return res.status(200).json({ message: "Child deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete child" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, eventDate } = req.body;

    if (!title || !eventDate) {
      return badRequest(res, "title and eventDate are required");
    }

    const event = await Event.create(req.body);
    return res.status(201).json(event);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to create event" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to update event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete event" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expenseDate: -1 }).populate("createdBy", "name email");
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, expenseDate } = req.body;

    if (!title || !amount || !expenseDate) {
      return badRequest(res, "title, amount and expenseDate are required");
    }

    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json(expense);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to create expense" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json(expense);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to update expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete expense" });
  }
};

exports.getVolunteerApplications = async (req, res) => {
  try {
    const { status = "", search = "" } = req.query;
    const query = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await VolunteerApplication.find(query).sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer applications" });
  }
};

exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return badRequest(res, "status must be either approved or rejected");
    }

    const application = await VolunteerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Volunteer application not found" });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.reviewNote = reviewNote;

    await application.save();

    return res.status(200).json(application);
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to update volunteer status" });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const {
      status = "",
      search = "",
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status && ["pending", "completed", "failed", "refunded"].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (parsedStartDate || parsedEndDate) {
      query.createdAt = {};
      if (parsedStartDate) query.createdAt.$gte = parsedStartDate;
      if (parsedEndDate) query.createdAt.$lte = parsedEndDate;
    }

    const parsedMinAmount = Number(minAmount);
    const parsedMaxAmount = Number(maxAmount);
    if (!Number.isNaN(parsedMinAmount) || !Number.isNaN(parsedMaxAmount)) {
      query.amount = {};
      if (!Number.isNaN(parsedMinAmount)) query.amount.$gte = parsedMinAmount;
      if (!Number.isNaN(parsedMaxAmount)) query.amount.$lte = parsedMaxAmount;
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [items, total] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Donation.countDocuments(query),
    ]);

    return res.status(200).json({
      items,
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch donations" });
  }
};

exports.getBlockchainRecords = async (req, res) => {
  try {
    const { search = "", donationId = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { transactionHash: { $regex: search, $options: "i" } },
        { donationReference: { $regex: search, $options: "i" } },
      ];
    }

    if (donationId) {
      const objectId = toObjectId(donationId);
      if (!objectId) {
        return badRequest(res, "Invalid donationId");
      }
      query.donationId = objectId;
    }

    const records = await BlockchainTransaction.find(query)
      .sort({ createdAt: -1 })
      .populate("donationId", "donorName amount status transactionId createdAt");

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blockchain records" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    const donationMatch = { status: "completed" };
    const expenseMatch = {};

    if (parsedStartDate || parsedEndDate) {
      donationMatch.createdAt = {};
      expenseMatch.expenseDate = {};

      if (parsedStartDate) {
        donationMatch.createdAt.$gte = parsedStartDate;
        expenseMatch.expenseDate.$gte = parsedStartDate;
      }

      if (parsedEndDate) {
        donationMatch.createdAt.$lte = parsedEndDate;
        expenseMatch.expenseDate.$lte = parsedEndDate;
      }
    }

    const [
      donationTotals,
      expenseTotals,
      totalChildren,
      totalEvents,
      pendingVolunteers,
      monthlyDonations,
      monthlyExpenses,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: donationMatch },
        { $group: { _id: null, totalAmount: { $sum: "$amount" }, totalCount: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: expenseMatch },
        { $group: { _id: null, totalAmount: { $sum: "$amount" }, totalCount: { $sum: 1 } } },
      ]),
      Child.countDocuments({ isActive: true }),
      Event.countDocuments(),
      VolunteerApplication.countDocuments({ status: "pending" }),
      Donation.aggregate([
        { $match: donationMatch },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Expense.aggregate([
        { $match: expenseMatch },
        {
          $group: {
            _id: {
              year: { $year: "$expenseDate" },
              month: { $month: "$expenseDate" },
            },
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const donationTotalAmount = donationTotals[0]?.totalAmount || 0;
    const donationTotalCount = donationTotals[0]?.totalCount || 0;
    const expenseTotalAmount = expenseTotals[0]?.totalAmount || 0;
    const expenseTotalCount = expenseTotals[0]?.totalCount || 0;

    return res.status(200).json({
      filters: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      summary: {
        donationTotalAmount,
        donationTotalCount,
        expenseTotalAmount,
        expenseTotalCount,
        netBalance: donationTotalAmount - expenseTotalAmount,
        totalChildren,
        totalEvents,
        pendingVolunteers,
      },
      monthlyDonations,
      monthlyExpenses,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate reports" });
  }
};
