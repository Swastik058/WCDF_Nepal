const express = require("express");
const {
  applyForVolunteer,
  getVolunteerStatus,
  getVolunteerProfile,
  updateVolunteerProfile,
  getVolunteerDashboard,
  getMyAssignedActivities,
  getMyTrackingHistory,
} = require("../controllers/volunteerController");
const { protect, requireApprovedVolunteer } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/apply", applyForVolunteer);
router.get("/status", getVolunteerStatus);
router.get("/profile", requireApprovedVolunteer, getVolunteerProfile);
router.put("/profile", requireApprovedVolunteer, updateVolunteerProfile);
router.get("/dashboard", requireApprovedVolunteer, getVolunteerDashboard);
router.get("/activities", requireApprovedVolunteer, getMyAssignedActivities);
router.get("/tracking-history", requireApprovedVolunteer, getMyTrackingHistory);

module.exports = router;
