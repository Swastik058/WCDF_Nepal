const BlockchainTransaction = require("../models/admin/BlockchainTransaction");
const Donation = require("../models/Donation");
const { getBlockchainDonationData } = require("../blockchain/ledger");

exports.getBlockchainVerification = async (req, res) => {
  try {
    const { txHash } = req.params;

    if (!txHash) {
      return res.status(400).json({ message: "Transaction hash is required" });
    }

    const blockchainData = await getBlockchainDonationData(txHash);

    if (!blockchainData.found) {
      return res.status(404).json({
        message: blockchainData.message || "Transaction not found on blockchain",
        verified: false,
      });
    }

    const blockchainTx = await BlockchainTransaction.findOne({ transactionHash: txHash });

    if (!blockchainTx) {
      return res.status(404).json({
        message: "No local record found for this transaction hash",
        verified: false,
      });
    }

    const donation = await Donation.findById(blockchainTx.donationId).select("amount donorName purpose status");
    const mongoAmount = donation?.amount ?? null;
    const blockchainAmount = blockchainData.blockchainAmount;

    const isTampered =
      mongoAmount !== null &&
      Math.round(mongoAmount * 100) !== Math.round(blockchainAmount * 100);

    return res.status(200).json({
      donationId: blockchainTx.donationId,
      transactionHash: txHash,
      mongoAmount,
      blockchainAmount,
      donorName: blockchainTx.donorName,
      purpose: donation?.purpose || null,
      timestamp: blockchainData.timestamp,
      blockNumber: blockchainData.blockNumber,
      status: isTampered ? "Tampered" : "Verified",
      verified: !isTampered,
    });
  } catch (error) {
    console.error("Blockchain verification error:", error);
    return res.status(500).json({ message: "Failed to verify transaction", error: error.message });
  }
};
