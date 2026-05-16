const express = require("express");
const { getBlockchainVerification } = require("../controllers/blockchainController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:txHash", protect, getBlockchainVerification);

module.exports = router;
