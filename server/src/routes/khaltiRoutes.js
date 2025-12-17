const express = require("express");
const router = express.Router();

const {
  initiateKhaltiPayment,
  verifyKhaltiPayment
} = require("../controllers/KhaltiDonationController");

const optionalAuth = require("../middleware/optionalAuth");

router.post("/initiate", optionalAuth, initiateKhaltiPayment);
router.post("/verify", optionalAuth, verifyKhaltiPayment);

module.exports = router;
