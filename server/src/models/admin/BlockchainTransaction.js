const mongoose = require("mongoose");

const blockchainTransactionSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },
    donationReference: {
      type: String,
      required: [true, "Donation reference is required"],
      trim: true,
    },
    transactionHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      trim: true,
      unique: true,
    },
    network: {
      type: String,
      trim: true,
      default: "hardhat",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "confirmed",
    },
    // Auto-incremented ID assigned by the contract — used to call getDonation(id)
    chainDonationId: {
      type: Number,
    },
    // Snapshot stored at confirmation time (paisa→NPR from parsed event)
    amount: {
      type: Number,
      required: true,
    },
    blockchainTimestamp: {
      type: Date,
    },
    donorName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockchainTransaction", blockchainTransactionSchema);
