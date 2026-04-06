const mongoose = require("mongoose");
const Child = require("../../models/admin/Child");
const Event = require("../../models/admin/Event");
const Expense = require("../../models/admin/Expense");
const VolunteerApplication = require("../../models/admin/VolunteerApplication");
const VolunteerTracking = require("../../models/admin/VolunteerTracking");
const Donation = require("../../models/Donation");
const BlockchainTransaction = require("../../models/admin/BlockchainTransaction");
const User = require("../../models/UserModel");

const badRequest = (res, message) => res.status(400).json({ message });

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDayRange = (value) => {
  const date = parseDate(value);
  if (!date) return null;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
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

const normalizeTrackedHours = (status, hoursCompleted) => {
  const parsedHours = Number(hoursCompleted);
  const safeHours = Number.isNaN(parsedHours) || parsedHours < 0 ? 0 : parsedHours;

  if (["assigned", "missed"].includes(status)) {
    return 0;
  }

  return safeHours;
};

const syncVolunteerTotalHours = async (volunteerId, previousHours, nextHours) => {
  const volunteer = await User.findById(volunteerId);
  if (!volunteer) {
    throw new Error("Volunteer not found");
  }

  // Safe hours update:
  // We only apply the difference between the old tracking hours and the new tracking hours.
  // Example: previous=5, next=3 means difference=-2, so total hours goes down by 2.
  // This prevents double-adding hours when admins edit an existing tracking record.
  const hourDifference = nextHours - previousHours;
  volunteer.totalVolunteerHours = Math.max(0, (volunteer.totalVolunteerHours || 0) + hourDifference);
  await volunteer.save();

  const application = await VolunteerApplication.findOne({ userId: volunteerId });
  if (application) {
    application.volunteerHours = volunteer.totalVolunteerHours;
    await application.save();
  }

  return volunteer.totalVolunteerHours;
};

const buildTrackingMap = (trackingItems) =>
  new Map(trackingItems.map((item) => [String(item.volunteerId), item]));

exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      donationSummary,
      totalChildren,
      totalEvents,
      expenseSummary,
      totalVolunteers,
      pendingVolunteerApprovals,
      rejectedVolunteerCount,
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
      VolunteerApplication.countDocuments({ status: "rejected" }),
      Donation.find({ status: "completed" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("donorName amount email status createdAt purpose"),
      VolunteerApplication.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email phone address createdAt"),
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
      volunteerSummary: {
        approved: totalVolunteers,
        pending: pendingVolunteerApprovals,
        rejected: rejectedVolunteerCount,
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
    const events = await Event.find()
      .populate("assignedVolunteers", "name email totalVolunteerHours")
      .sort({ eventDate: -1 });
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

exports.getApprovedVolunteers = async (req, res) => {
  try {
    const volunteers = await VolunteerApplication.find({ status: "approved" })
      .populate("userId", "name email totalVolunteerHours volunteerStatus isVolunteer")
      .sort({ fullName: 1 });

    const items = volunteers
      .filter((item) => item.userId?.isVolunteer && item.userId?.volunteerStatus === "approved")
      .map((item) => ({
        _id: item.userId._id,
        fullName: item.fullName || item.userId.name,
        email: item.email || item.userId.email,
        phone: item.phone || "",
        totalVolunteerHours: item.userId.totalVolunteerHours || 0,
      }));

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch approved volunteers" });
  }
};

exports.getAssignedVolunteersForActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const event = await Event.findById(activityId).populate(
      "assignedVolunteers",
      "name email totalVolunteerHours volunteerStatus isVolunteer"
    );

    if (!event) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const trackingItems = await VolunteerTracking.find({ activityId });
    const trackingMap = buildTrackingMap(trackingItems);

    const assignedVolunteers = event.assignedVolunteers.map((volunteer) => {
      const tracking = trackingMap.get(String(volunteer._id));

      return {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        totalVolunteerHours: volunteer.totalVolunteerHours || 0,
        tracking: tracking || {
          participationStatus: "assigned",
          hoursCompleted: 0,
          remarks: "",
        },
      };
    });

    return res.status(200).json({
      activity: {
        _id: event._id,
        title: event.title,
        status: event.status,
        eventDate: event.eventDate,
      },
      assignedVolunteers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch assigned volunteers" });
  }
};

exports.assignVolunteerToActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return badRequest(res, "volunteerId is required");
    }

    const event = await Event.findById(activityId);
    if (!event) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || !volunteer.isVolunteer || volunteer.volunteerStatus !== "approved") {
      return res.status(400).json({ message: "Only approved volunteers can be assigned" });
    }

    const alreadyAssigned = event.assignedVolunteers.some(
      (item) => String(item) === String(volunteerId)
    );

    if (alreadyAssigned) {
      return res.status(400).json({ message: "Volunteer is already assigned to this activity" });
    }

    const dayRange = getDayRange(event.eventDate);
    if (dayRange) {
      const conflictingEvent = await Event.findOne({
        _id: { $ne: activityId },
        assignedVolunteers: volunteerId,
        status: { $ne: "cancelled" },
        eventDate: {
          $gte: dayRange.start,
          $lte: dayRange.end,
        },
      }).select("title eventDate status");

      if (conflictingEvent) {
        return res.status(409).json({
          message: `This volunteer is already assigned to "${conflictingEvent.title}" on the same date.`,
          conflict: {
            _id: conflictingEvent._id,
            title: conflictingEvent.title,
            eventDate: conflictingEvent.eventDate,
            status: conflictingEvent.status,
          },
        });
      }
    }

    event.assignedVolunteers.push(volunteerId);
    await event.save();

    await VolunteerTracking.findOneAndUpdate(
      { volunteerId, activityId },
      {
        volunteerId,
        activityId,
        participationStatus: "assigned",
        hoursCompleted: 0,
        remarks: "",
        updatedBy: req.user._id,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({ message: "Volunteer assigned successfully" });
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to assign volunteer to activity" });
  }
};

exports.removeVolunteerFromActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return badRequest(res, "volunteerId is required");
    }

    const event = await Event.findById(activityId);
    if (!event) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const wasAssigned = event.assignedVolunteers.some(
      (item) => String(item) === String(volunteerId)
    );

    if (!wasAssigned) {
      return res.status(404).json({ message: "Volunteer is not assigned to this activity" });
    }

    event.assignedVolunteers = event.assignedVolunteers.filter(
      (item) => String(item) !== String(volunteerId)
    );
    await event.save();

    const existingTracking = await VolunteerTracking.findOne({ volunteerId, activityId });
    if (existingTracking) {
      await syncVolunteerTotalHours(volunteerId, existingTracking.hoursCompleted || 0, 0);
      await VolunteerTracking.findByIdAndDelete(existingTracking._id);
    }

    return res.status(200).json({ message: "Volunteer removed from activity successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove volunteer from activity" });
  }
};

exports.updateVolunteerTrackingForActivity = async (req, res) => {
  try {
    const { activityId, volunteerId } = req.params;
    const { participationStatus = "assigned", hoursCompleted = 0, remarks = "" } = req.body;

    const event = await Event.findById(activityId);
    if (!event) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || !volunteer.isVolunteer || volunteer.volunteerStatus !== "approved") {
      return res.status(404).json({ message: "Approved volunteer not found" });
    }

    const isAssigned = event.assignedVolunteers.some(
      (item) => String(item) === String(volunteerId)
    );

    if (!isAssigned) {
      return res.status(400).json({ message: "Volunteer must be assigned before tracking can be updated" });
    }

    const existingTracking = await VolunteerTracking.findOne({ volunteerId, activityId });
    const previousHours = existingTracking?.hoursCompleted || 0;
    const normalizedHours = normalizeTrackedHours(participationStatus, hoursCompleted);

    const tracking = await VolunteerTracking.findOneAndUpdate(
      { volunteerId, activityId },
      {
        volunteerId,
        activityId,
        participationStatus,
        hoursCompleted: normalizedHours,
        remarks: remarks.trim(),
        updatedBy: req.user._id,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const totalVolunteerHours = await syncVolunteerTotalHours(
      volunteerId,
      previousHours,
      normalizedHours
    );

    return res.status(200).json({
      message: "Volunteer tracking updated successfully",
      tracking,
      totalVolunteerHours,
    });
  } catch (error) {
    const errors = formatValidationError(error);
    if (errors) return res.status(400).json({ message: "Validation error", errors });
    return res.status(500).json({ message: "Failed to update volunteer tracking" });
  }
};

exports.getVolunteerTrackingForActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const event = await Event.findById(activityId).populate(
      "assignedVolunteers",
      "name email totalVolunteerHours"
    );

    if (!event) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const trackingItems = await VolunteerTracking.find({ activityId })
      .populate("volunteerId", "name email totalVolunteerHours")
      .populate("updatedBy", "name email")
      .sort({ updatedAt: -1 });

    const trackingMap = new Map(
      trackingItems.map((item) => [String(item.volunteerId?._id || item.volunteerId), item])
    );

    const items = event.assignedVolunteers.map((volunteer) => {
      const tracking = trackingMap.get(String(volunteer._id));

      return {
        volunteer: {
          _id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          totalVolunteerHours: volunteer.totalVolunteerHours || 0,
        },
        tracking: tracking || {
          participationStatus: "assigned",
          hoursCompleted: 0,
          remarks: "",
          updatedAt: null,
          updatedBy: null,
        },
      };
    });

    return res.status(200).json({
      activity: {
        _id: event._id,
        title: event.title,
        status: event.status,
        eventDate: event.eventDate,
      },
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer tracking for activity" });
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
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await VolunteerApplication.find(query)
      .populate("userId", "name email volunteerStatus isVolunteer")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer applications" });
  }
};

exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks = "", rejectionReason = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return badRequest(res, "status must be either approved or rejected");
    }

    const application = await VolunteerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Volunteer application not found" });
    }

    const applicant = await User.findById(application.userId);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant user not found" });
    }

    application.status = status;
    application.approvedBy = status === "approved" ? req.user._id : null;
    application.approvedAt = status === "approved" ? new Date() : null;
    application.reviewedAt = new Date();
    application.adminRemarks = adminRemarks;
    application.rejectionReason = status === "rejected" ? rejectionReason : "";
    application.recentActivity.unshift({
      title: status === "approved" ? "Application approved" : "Application rejected",
      description:
        status === "approved"
          ? "Admin approved this volunteer application."
          : rejectionReason || "Admin rejected this volunteer application.",
      activityDate: new Date(),
    });
    application.recentActivity = application.recentActivity.slice(0, 10);

    await application.save();

    applicant.volunteerStatus = status;
    applicant.isVolunteer = status === "approved";
    applicant.volunteerApprovedAt = status === "approved" ? application.approvedAt : null;
    await applicant.save();

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
