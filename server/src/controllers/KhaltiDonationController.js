const axios = require("axios");
const Donation = require("../models/Donation");
const Child = require("../models/admin/Child");
const { recordDonationOnChain } = require("../blockchain/ledger"); 
const BlockchainTransaction = require("../models/admin/BlockchainTransaction");
const { completeChildSponsorship } = require("../services/sponsorshipService");


/**
 * STEP 1: Initiate Khalti Payment
 * POST /api/khalti/initiate
 */
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { donorName, email, amount, purpose, description, childId } = req.body;

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: "Authentication required to make donations" 
      });
    }

    // Validation
    if (!donorName || !email || !amount || amount <= 0) {
      return res.status(400).json({ 
        message: "Missing required fields: donorName, email, and valid amount" 
      });
    }

    // Khalti expects amount in paisa (multiply by 100)
    const amountInPaisa = Math.round(amount * 100);
    let sponsorshipChild = null;

    if (childId) {
      sponsorshipChild = await Child.findById(childId).select("name fullName yearlyCost isSponsored");

      if (!sponsorshipChild) {
        return res.status(404).json({ message: "Selected child could not be found" });
      }

      if (sponsorshipChild.isSponsored) {
        return res.status(400).json({ message: "This child has already been sponsored" });
      }

      if (Number(sponsorshipChild.yearlyCost || 0) > 0 && Number(amount) !== Number(sponsorshipChild.yearlyCost)) {
        return res.status(400).json({
          message: `Sponsorship amount must match the yearly cost of NPR ${sponsorshipChild.yearlyCost}`,
        });
      }
    }

    // Create donation record as PENDING
    const donation = await Donation.create({
      donorName: donorName.trim(),
      email: email.trim().toLowerCase(),
      amount: amount,
      paymentMethod: "khalti",
      purpose: sponsorshipChild
        ? `Child Sponsorship: ${sponsorshipChild.name || sponsorshipChild.fullName}`
        : purpose || "General donation",
      description: description || "",
      userId: req.user.id,
      childId: sponsorshipChild?._id || null,
      isChildSponsorship: Boolean(sponsorshipChild),
      status: "pending"
    });

    const payload = {
      return_url: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/khalti/verify`,
      website_url: process.env.CLIENT_URL || 'http://localhost:3000',
      amount: amountInPaisa,
      purchase_order_id: donation._id.toString(),
      purchase_order_name: "WCDF Nepal Donation",
      customer_info: {
        name: donorName,
        email: email
      }
    };

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
    res.status(500).json({ message: "Failed to initiate Khalti payment" });
  }
};

exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.query;

    console.log('Khalti verification started for pidx:', pidx);

    if (!pidx) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/donate?payment=failed&error=missing_pidx`);
    }

    const donation = await Donation.findOne({ pidx });
    
    if (!donation) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/donate?payment=failed&error=donation_not_found`);
    }

    if (donation.status === 'completed') {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?payment=success`);
    }

    const khaltiResponse = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { status, transaction_id, total_amount } = khaltiResponse.data;

    if (status === "Completed") {
      donation.status = "completed";
      donation.transactionId = transaction_id;
      await donation.save();
      await completeChildSponsorship({
        donation,
        userId: donation.userId,
      });

      //  BLOCKCHAIN RECORD (ONLY AFTER CONFIRMED PAYMENT)
      let blockchainTxHash = null;
      try {
        blockchainTxHash = await recordDonationOnChain(
          donation.createdAt.getTime(),
          Math.round(donation.amount * 100)
        );
      } catch (chainError) {
        console.error("Blockchain recording failed:", chainError.message);
      }

      if (blockchainTxHash) {
        await BlockchainTransaction.create({
          donationId: donation._id,
          donationReference: donation._id.toString(),
          transactionHash: blockchainTxHash,
          network: process.env.BLOCKCHAIN_NETWORK || "hardhat",
          status: "confirmed",
        });
      }

      const successParams = new URLSearchParams({ payment: "success" });
      if (donation.childId) {
        successParams.set("childId", donation.childId.toString());
      }

      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?${successParams.toString()}`);
      
    } else {
      donation.status = "failed";
      await donation.save();

      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/donate?payment=failed&reason=${encodeURIComponent(status)}`);
    }

  } catch (error) {
    console.error("Khalti verification error:", error.message);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/donate?payment=failed&error=verification_failed`);
  }
};
