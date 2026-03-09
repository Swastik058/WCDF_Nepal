// const express = require("express");
// const router = express.Router();

// const {
//   initiateKhaltiPayment,
//   verifyKhaltiPayment
// } = require("../controllers/KhaltiDonationController");

// const authMiddleware = require("../middleware/authMiddleware");

// // POST /api/khalti/initiate - Initiate payment (requires authentication)
// router.post("/initiate", authMiddleware, initiateKhaltiPayment);

// // GET /api/khalti/verify - Verify payment (called by Khalti, no auth needed)
// // This is the callback URL that Khalti calls after payment
// router.get("/verify", verifyKhaltiPayment);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  initiateKhaltiPayment,
  verifyKhaltiPayment
} = require("../controllers/KhaltiDonationController");

const { protect } = require("../middleware/authMiddleware");

// POST /api/khalti/initiate
router.post("/initiate", protect, initiateKhaltiPayment);

// GET /api/khalti/verify
router.get("/verify", verifyKhaltiPayment);

module.exports = router;