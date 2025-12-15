const express = require("express");
const { createDonation } = require("../controllers/DonationController");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

// POST /api/donation - Create a new donation
// Optional authentication - allows both authenticated and anonymous donations
router.post("/", optionalAuth, createDonation);

module.exports = router;
