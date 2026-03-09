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
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockchainTransaction", blockchainTransactionSchema);
