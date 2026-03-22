const VolunteerApplication = require("../models/admin/VolunteerApplication");
const Event = require("../models/admin/Event");
const VolunteerTracking = require("../models/admin/VolunteerTracking");

const parseSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildStatusPayload = (application, user) => ({
  hasApplied: !!application,
  status: application?.status || user?.volunteerStatus || "not_applied",
  isVolunteer: !!user?.isVolunteer,
  approvedAt: application?.approvedAt || user?.volunteerApprovedAt || null,
  rejectionReason: application?.rejectionReason || "",
  adminRemarks: application?.adminRemarks || "",
  application,
});

const addActivity = (application, title, description) => {
  application.recentActivity.unshift({
    title,
    description,
    activityDate: new Date(),
  });

  application.recentActivity = application.recentActivity.slice(0, 10);
};

exports.applyForVolunteer = async (req, res) => {
  try {
    const user = req.user;
    const {
      fullName,
      phone,
      address,
      skills,
      availability,
      reasonForJoining,
      previousExperience = "",
    } = req.body;

    if (!fullName || !phone || !address || !availability || !reasonForJoining) {
      return res.status(400).json({
        message: "fullName, phone, address, availability and reasonForJoining are required",
      });
    }

    const existingApplication = await VolunteerApplication.findOne({ userId: user._id });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already submitted a volunteer application",
        application: existingApplication,
      });
    }

    const application = await VolunteerApplication.create({
      userId: user._id,
      fullName: fullName.trim(),
      email: user.email,
      phone: phone.trim(),
      address: address.trim(),
      skills: parseSkills(skills),
      availability: availability.trim(),
      reasonForJoining: reasonForJoining.trim(),
      previousExperience: previousExperience.trim(),
      recentActivity: [
        {
          title: "Application submitted",
          description: "Volunteer application was submitted and is waiting for admin review.",
          activityDate: new Date(),
        },
      ],
    });

    user.volunteerStatus = "pending";
    user.isVolunteer = false;
    user.volunteerApprovedAt = null;
    await user.save();

    return res.status(201).json({
      message: "Volunteer application submitted successfully",
      ...buildStatusPayload(application, user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit volunteer application" });
  }
};

exports.getVolunteerStatus = async (req, res) => {
  try {
    const application = await VolunteerApplication.findOne({ userId: req.user._id })
      .populate("approvedBy", "name email");

    return res.status(200).json(buildStatusPayload(application, req.user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer status" });
  }
};

exports.getVolunteerProfile = async (req, res) => {
  try {
    const application = await VolunteerApplication.findOne({ userId: req.user._id });

    if (!application) {
      return res.status(404).json({ message: "Volunteer application not found" });
    }

    return res.status(200).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer profile" });
  }
};

exports.updateVolunteerProfile = async (req, res) => {
  try {
    const application = await VolunteerApplication.findOne({ userId: req.user._id });

    if (!application) {
      return res.status(404).json({ message: "Volunteer application not found" });
    }

    const allowedUpdates = [
      "fullName",
      "phone",
      "address",
      "skills",
      "availability",
      "reasonForJoining",
      "previousExperience",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] === undefined) return;

      if (field === "skills") {
        application.skills = parseSkills(req.body.skills);
        return;
      }

      application[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
    });

    addActivity(application, "Profile updated", "Volunteer profile information was updated.");
    await application.save();

    return res.status(200).json({
      message: "Volunteer profile updated successfully",
      profile: application,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update volunteer profile" });
  }
};

exports.getVolunteerDashboard = async (req, res) => {
  try {
    const application = await VolunteerApplication.findOne({ userId: req.user._id });
    const assignedEvents = await Event.find({ assignedVolunteers: req.user._id })
      .select("title location eventDate status")
      .sort({ eventDate: 1 });
    const trackingHistory = await VolunteerTracking.find({ volunteerId: req.user._id })
      .populate("activityId", "title location eventDate status")
      .sort({ updatedAt: -1 });

    if (!application) {
      return res.status(404).json({ message: "Volunteer application not found" });
    }

    return res.status(200).json({
      volunteer: {
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        status: application.status,
        volunteerHours: req.user.totalVolunteerHours || application.volunteerHours || 0,
        approvedAt: application.approvedAt,
      },
      summary: {
        volunteerHours: req.user.totalVolunteerHours || application.volunteerHours || 0,
        assignedEventsCount: assignedEvents.length,
        recentActivityCount: trackingHistory.length,
      },
      assignedEvents,
      recentActivity: trackingHistory.map((item) => ({
        title: item.activityId?.title || "Volunteer activity",
        description: `${item.participationStatus} - ${item.hoursCompleted} hour(s)`,
        activityDate: item.updatedAt,
        participationStatus: item.participationStatus,
        hoursCompleted: item.hoursCompleted,
        remarks: item.remarks,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer dashboard" });
  }
};

exports.getMyAssignedActivities = async (req, res) => {
  try {
    const activities = await Event.find({ assignedVolunteers: req.user._id })
      .select("title description location eventDate eventType status")
      .sort({ eventDate: 1 });

    return res.status(200).json(activities);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch assigned activities" });
  }
};

exports.getMyTrackingHistory = async (req, res) => {
  try {
    const history = await VolunteerTracking.find({ volunteerId: req.user._id })
      .populate("activityId", "title description location eventDate eventType status")
      .populate("updatedBy", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer tracking history" });
  }
};
