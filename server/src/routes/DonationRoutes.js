const express = require("express");
const { createDonation, getUserDonations } = require("../controllers/DonationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/donation - Get user donations (protected)
router.get("/", authMiddleware, getUserDonations);

// POST /api/donation - Create a new donation (protected)
router.post("/", authMiddleware, createDonation);

module.exports = router;

