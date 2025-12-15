const express = require("express");
const { createBooking, getBookings } = require("../controllers/BookingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/booking - Create a new booking
router.post("/", createBooking);

// GET /api/booking - Get all bookings (requires authentication)
router.get("/", authMiddleware, getBookings);

module.exports = router;

