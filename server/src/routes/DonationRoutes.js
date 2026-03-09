// const express = require("express");
// const { createDonation } = require("../controllers/DonationController");
// // Optional: Import auth middleware if donations should be protected
// // const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // POST /api/donation - Create a new donation
// // Note: Removed authMiddleware to allow anonymous donations

// const authMiddleware = require("../middleware/authMiddleware");

// router.post("/", authMiddleware, createDonation);

// module.exports = router;

const express = require("express");
const { createDonation } = require("../controllers/DonationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createDonation);

module.exports = router;