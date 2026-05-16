const express = require("express");
const multer = require("multer");
const { galleryUpload } = require("../../middleware/uploadMiddleware");
const {
  getDashboardSummary,
  getAdminStats,
  getChildren,
  createChild,
  updateChild,
  deleteChild,
  getSponsorships,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getApprovedVolunteers,
  getAssignedVolunteersForActivity,
  assignVolunteerToActivity,
  removeVolunteerFromActivity,
  updateVolunteerTrackingForActivity,
  getVolunteerTrackingForActivity,
  getVolunteerApplications,
  updateVolunteerStatus,
  logManualHours,
  deleteManualHourLog,
  getDonations,
  getBlockchainRecords,
  getBlockchainAuditReport,
  verifyBlockchainHash,
  deleteBlockchainRecord,
  purgeStaleBlockchainRecords,
  getReports,
  uploadChildPhoto,
} = require("../../controllers/admin/adminController");

const childPhotoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
const {
  createGalleryCategory,
  getAllGalleryCategoriesAdmin,
  updateGalleryCategory,
  deleteGalleryCategory,
} = require("../../controllers/admin/galleryCategoryController");
const {
  uploadGalleryImages,
  getAllGalleryImagesAdmin,
  updateGalleryImage,
  deleteGalleryImage,
  toggleGalleryImagePublish,
} = require("../../controllers/admin/galleryImageController");
const { protect, adminOnly } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardSummary);
router.get("/stats", getAdminStats);

router.get("/children", getChildren);
router.post("/children/upload-photo", childPhotoUpload.single("photo"), uploadChildPhoto);
router.post("/children", createChild);
router.put("/children/:id", updateChild);
router.delete("/children/:id", deleteChild);
router.get("/sponsorships", getSponsorships);

router.get("/events", getEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);
router.get("/programs", getPrograms);
router.post("/programs", createProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);
router.post("/gallery/categories", createGalleryCategory);
router.get("/gallery/categories", getAllGalleryCategoriesAdmin);
router.put("/gallery/categories/:id", updateGalleryCategory);
router.delete("/gallery/categories/:id", deleteGalleryCategory);
router.post("/gallery/upload", galleryUpload.array("images", 12), uploadGalleryImages);
router.get("/gallery/images", getAllGalleryImagesAdmin);
router.put("/gallery/images/:id", updateGalleryImage);
router.delete("/gallery/images/:id", deleteGalleryImage);
router.patch("/gallery/images/:id/toggle-publish", toggleGalleryImagePublish);
router.get("/volunteers/approved", getApprovedVolunteers);
router.get("/activities/:activityId/assigned-volunteers", getAssignedVolunteersForActivity);
router.put("/activities/:activityId/assign-volunteer", assignVolunteerToActivity);
router.put("/activities/:activityId/remove-volunteer", removeVolunteerFromActivity);
router.put("/activities/:activityId/track-volunteer/:volunteerId", updateVolunteerTrackingForActivity);
router.get("/activities/:activityId/tracking", getVolunteerTrackingForActivity);

router.get("/expenses", getExpenses);
router.post("/expenses", createExpense);
router.put("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);

router.get("/volunteers", getVolunteerApplications);
router.patch("/volunteers/:id/status", updateVolunteerStatus);
router.post("/volunteers/:id/log-hours", logManualHours);
router.delete("/volunteers/:id/log-hours/:logId", deleteManualHourLog);

router.get("/donations", getDonations);
router.get("/blockchain-records", getBlockchainRecords);
router.delete("/blockchain-records/purge-stale", purgeStaleBlockchainRecords);
router.delete("/blockchain-records/:id", deleteBlockchainRecord);
router.get("/blockchain/audit-report", getBlockchainAuditReport);
router.get("/blockchain/verify/:transactionHash", verifyBlockchainHash);
router.get("/reports", getReports);

module.exports = router;
