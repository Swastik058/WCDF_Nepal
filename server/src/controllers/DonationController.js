const Donation = require("../models/Donation");

// GET /donation - Get user donations
exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: "Authentication required to view donations" 
      });
    }

    // Find donations for the authenticated user
    const donations = await Donation.find({ userId })
      .sort({ createdAt: -1 }) // Most recent first
      .select('-__v'); // Exclude version field

    res.status(200).json({
      message: "Donations retrieved successfully",
      donations,
      count: donations.length
    });

  } catch (err) {
    console.error("Get donations error:", err);
    res.status(500).json({ 
      message: "Failed to retrieve donations",
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
};

// POST /donation - Create a new donation
exports.createDonation = async (req, res) => {
  try {
    const { donorName, email, amount, paymentMethod, purpose, description, transactionId } = req.body;

    // Validation checks
    if (!donorName || donorName.trim() === "") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { donorName: "Donor name is required" }
      });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { email: "Email is required" }
      });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { email: "Please provide a valid email address" }
      });
    }

    // Validate and convert amount to number
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { amount: "Donation amount must be a valid number greater than 0" }
      });
    }

    if (!paymentMethod || paymentMethod.trim() === "") {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { paymentMethod: "Payment method is required" }
      });
    }

    const validPaymentMethods = ["credit_card", "debit_card", "paypal", "bank_transfer", "cash", "other"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: { 
          paymentMethod: `Payment method must be one of: ${validPaymentMethods.join(", ")}` 
        }
      });
    }

    //  Link to user if authenticated
    const userId = req.user.id;  // req.user always exists because route is protected


    // Create donation record
    const donation = await Donation.create({
      donorName: donorName.trim(),
      email: email.trim().toLowerCase(),
      amount: parsedAmount,
      paymentMethod: paymentMethod.trim(),
      purpose: purpose ? purpose.trim() : "General donation",
      description: description ? description.trim() : undefined,
      transactionId: transactionId ? transactionId.trim() : null,
      userId: userId,
      status: "pending"
    });

    // Return success response with donation details
    res.status(201).json({
      message: "Donation recorded successfully",
      donation: {
        id: donation._id,
        donorName: donation.donorName,
        email: donation.email,
        amount: donation.amount,
        paymentMethod: donation.paymentMethod,
        purpose: donation.purpose,
        status: donation.status,
        createdAt: donation.createdAt
      }
    });

  } catch (err) {
    // Handle Mongoose validation errors
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

    // Handle duplicate key errors or other database errors
    console.error("Donation creation error:", err);
    res.status(500).json({ 
      message: "Failed to record donation",
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
};

