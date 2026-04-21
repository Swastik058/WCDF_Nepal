const Donation = require("../models/Donation");
const Child = require("../models/admin/Child");

const findSponsorshipChild = async (childId) => {
  if (!childId) return null;
  return Child.findById(childId).select("name fullName yearlyCost isSponsored");
};

// POST /donation - Create a new donation
exports.createDonation = async (req, res) => {
  try {
    const { donorName, email, amount, paymentMethod, purpose, description, transactionId, childId } = req.body;

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
    const child = await findSponsorshipChild(childId);

    if (childId && !child) {
      return res.status(404).json({ message: "Selected child could not be found" });
    }

    if (child?.isSponsored) {
      return res.status(400).json({ message: "This child has already been sponsored" });
    }

    if (child && child.yearlyCost > 0 && parsedAmount !== child.yearlyCost) {
      return res.status(400).json({
        message: `Sponsorship amount must match the yearly cost of NPR ${child.yearlyCost}`,
      });
    }


    // Create donation record
    const donation = await Donation.create({
      donorName: donorName.trim(),
      email: email.trim().toLowerCase(),
      amount: parsedAmount,
      paymentMethod: paymentMethod.trim(),
      purpose: child
        ? `Child Sponsorship: ${child.name || child.fullName}`
        : purpose ? purpose.trim() : "General donation",
      description: description ? description.trim() : undefined,
      transactionId: transactionId ? transactionId.trim() : null,
      userId: userId,
      childId: child?._id || null,
      isChildSponsorship: Boolean(child),
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
        childId: donation.childId,
        isChildSponsorship: donation.isChildSponsorship,
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

// GET /donation - Get user donations
exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.user.id;

    const donations = await Donation.find({ userId })
      .sort({ createdAt: -1 })
      .select('donorName email amount paymentMethod purpose status transactionId createdAt childId isChildSponsorship');

    res.status(200).json({
      message: "Donations retrieved successfully",
      donations
    });

  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ 
      message: "Failed to fetch donations",
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
};

