const express = require("express");
const {
  getDashboardSummary,
  getChildren,
  createChild,
  updateChild,
  deleteChild,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getVolunteerApplications,
  updateVolunteerStatus,
  getDonations,
  getBlockchainRecords,
  getReports,
} = require("../../controllers/admin/adminController");
const { protect, adminOnly } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardSummary);

router.get("/children", getChildren);
router.post("/children", createChild);
router.put("/children/:id", updateChild);
router.delete("/children/:id", deleteChild);

router.get("/events", getEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

router.get("/expenses", getExpenses);
router.post("/expenses", createExpense);
router.put("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);

router.get("/volunteers", getVolunteerApplications);
router.patch("/volunteers/:id/status", updateVolunteerStatus);

router.get("/donations", getDonations);
router.get("/blockchain-records", getBlockchainRecords);
router.get("/reports", getReports);

module.exports = router;
