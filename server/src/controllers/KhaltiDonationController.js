const axios = require("axios");
const Donation = require("../models/Donation");

/**
 * STEP 1: Initiate Khalti Payment
 * POST /api/khalti/initiate
 */
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { donorName, email, amount, purpose, description } = req.body;

    // Validation
    if (!donorName || !email || !amount || amount <= 0) {
      return res.status(400).json({ 
        message: "Missing required fields: donorName, email, and valid amount" 
      });
    }

    // Khalti expects amount in paisa (multiply by 100)
    const amountInPaisa = Math.round(amount * 100);

    // Create donation record as PENDING
    const donation = await Donation.create({
      donorName: donorName.trim(),
      email: email.trim().toLowerCase(),
      amount: amount,
      paymentMethod: "khalti",
      purpose: purpose || "General donation",
      description: description || "",
      userId: req.user?.id || null,
      status: "pending"
    });

    // Khalti payment initiation payload
    const payload = {
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/khalti/verify`,
      website_url: process.env.CLIENT_URL || 'http://localhost:5173',
      amount: amountInPaisa,
      purchase_order_id: donation._id.toString(),
      purchase_order_name: "WCDF Nepal Donation",
      customer_info: {
        name: donorName,
        email: email
      }
    };

    // Call Khalti API
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Save pidx to donation record
    donation.pidx = response.data.pidx;
    await donation.save();

    res.status(200).json({
      message: "Payment initiated successfully",
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      donation_id: donation._id
    });

  } catch (error) {
    console.error("Khalti Initiation Error:", error.response?.data || error.message);
    
    // Return specific error from Khalti if available
    if (error.response?.data) {
      return res.status(400).json({ 
        message: "Khalti payment initiation failed",
        error: error.response.data
      });
    }
    
    res.status(500).json({ message: "Failed to initiate Khalti payment" });
  }
};


/**
 * STEP 2: Verify Khalti Payment
 * POST /api/khalti/verify
 */
exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required for verification" });
    }

    // Find donation record
    const donation = await Donation.findOne({ pidx });
    if (!donation) {
      return res.status(404).json({ message: "Donation record not found" });
    }

    // Call Khalti lookup API to verify payment
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { status, transaction_id, total_amount } = response.data;

    // Update donation based on payment status
    if (status === "Completed") {
      // Verify amount matches (Khalti returns amount in paisa)
      const expectedAmount = Math.round(donation.amount * 100);
      if (total_amount !== expectedAmount) {
        console.warn(`Amount mismatch: Expected ${expectedAmount}, Got ${total_amount}`);
      }

      donation.status = "completed";
      donation.transactionId = transaction_id;
      await donation.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        donation: {
          id: donation._id,
          donorName: donation.donorName,
          amount: donation.amount,
          status: donation.status,
          transactionId: donation.transactionId,
          createdAt: donation.createdAt
        }
      });
    } else {
      // Payment not completed - update status accordingly
      const failureStatus = ["Expired", "User canceled", "Failed"].includes(status) ? "failed" : "pending";
      donation.status = failureStatus;
      await donation.save();

      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${status}`,
        donation: {
          id: donation._id,
          status: donation.status
        }
      });
    }

  } catch (error) {
    console.error("Khalti Verification Error:", error.response?.data || error.message);
    
    // Return specific error from Khalti if available
    if (error.response?.data) {
      return res.status(400).json({ 
        success: false,
        message: "Payment verification failed",
        error: error.response.data
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to verify payment" 
    });
  }
};
