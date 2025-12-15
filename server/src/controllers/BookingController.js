const Booking = require("../models/Booking");

// POST /booking - Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { name, email, phone, date, time, purpose, description } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { name: "Name is required" }
      });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { email: "Email is required" }
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { email: "Please provide a valid email address" }
      });
    }

    if (!date) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { date: "Date is required" }
      });
    }

    // Link to user if authenticated
    const userId = req.user?.id || null;

    // Create booking record
    const booking = await Booking.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      date,
      time: time || null,
      purpose: purpose ? purpose.trim() : "General visit",
      description: description ? description.trim() : null,
      userId: userId,
      status: "pending"
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        name: booking.name,
        email: booking.email,
        date: booking.date,
        time: booking.time,
        purpose: booking.purpose,
        status: booking.status,
        createdAt: booking.createdAt
      }
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ 
        message: "Validation error",
        errors 
      });
    }

    console.error("Booking creation error:", err);
    res.status(500).json({ 
      message: "Failed to create booking",
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
};

// GET /booking - Get all bookings (for authenticated users)
exports.getBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    let bookings;
    if (userId) {
      bookings = await Booking.find({ userId }).sort({ date: 1 });
    } else {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings
    });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ 
      message: "Failed to retrieve bookings",
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
};

