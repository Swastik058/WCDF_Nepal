const { ethers } = require("ethers");
const abi = require("../../../blockchain/artifacts/contracts/DonationLedger.sol/DonationLedger.json").abi;

const rpcUrl = process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(rpcUrl);

const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.HARDHAT_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contract = new ethers.Contract(contractAddress, abi, wallet);

/**
 * Records a donation on chain.
 * The contract auto-increments an ID and stores amount + block.timestamp.
 * Returns the chain-assigned ID, confirmed amount (NPR), and block timestamp.
 */
async function recordDonationOnChain(amountPaisa) {
  console.log("[ledger] recording donation — paisa:", amountPaisa);

  const tx = await contract.recordDonation(BigInt(amountPaisa));
  const receipt = await tx.wait();

  // Read the chain donation ID from the emitted event
  const iface = new ethers.Interface(abi);
  let chainDonationId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "DonationRecorded") {
        chainDonationId = Number(parsed.args[0]);
        break;
      }
    } catch (_) {}
  }

  const block = await provider.getBlock(receipt.blockNumber);
  const blockchainTimestamp = new Date(
    (block?.timestamp ?? Math.floor(Date.now() / 1000)) * 1000
  ).toISOString();

  console.log("[ledger] confirmed — chainId:", chainDonationId, "NPR:", amountPaisa / 100);

  return {
    txHash: tx.hash,
    chainDonationId,
    blockchainAmount: amountPaisa / 100, // paisa → NPR
    blockchainTimestamp,
  };
}

/**
 * Fetches stored donation data directly from contract state.
 * Much simpler than parsing receipts — works as long as the node is running.
 */
async function getDonationFromChain(chainDonationId) {
  if (!chainDonationId) return { found: false, reason: "No chain donation ID" };

  try {
    const [amount, timestamp] = await contract.getDonation(BigInt(chainDonationId));
    return {
      found: true,
      chainDonationId: Number(chainDonationId),
      blockchainAmount: Number(amount) / 100, // paisa → NPR
      blockchainTimestamp: new Date(Number(timestamp) * 1000).toISOString(),
    };
  } catch (error) {
    console.error("[ledger] getDonationFromChain error:", error.message);
    return { found: false, reason: error.message };
  }
}

/**
 * Legacy: fetch by tx hash (receipt parsing). Used as fallback for old records
 * that pre-date the contract upgrade (no chainDonationId stored).
 */
async function getDonationFromTx(txHash) {
  if (!txHash) return { found: false, reason: "No transaction hash" };

  try {
    const txReceipt = await provider.getTransactionReceipt(txHash);
    if (!txReceipt) return { found: false, reason: "Transaction not found on chain" };

    const iface = new ethers.Interface(abi);
    let eventData = null;
    for (const log of txReceipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === "DonationRecorded") {
          eventData = {
            chainDonationId: Number(parsed.args[0]),
            amountPaisa: Number(parsed.args[1]),
            timestamp: Number(parsed.args[2]),
          };
          break;
        }
      } catch (_) {}
    }

    if (!eventData) return { found: false, reason: "DonationRecorded event not found" };

    const block = await provider.getBlock(txReceipt.blockNumber);
    return {
      found: true,
      chainDonationId: eventData.chainDonationId,
      blockchainAmount: eventData.amountPaisa / 100,
      blockchainTimestamp: new Date(
        (block?.timestamp ?? eventData.timestamp) * 1000
      ).toISOString(),
      transactionHash: txReceipt.hash,
    };
  } catch (error) {
    console.error("[ledger] getDonationFromTx error:", error.message);
    return { found: false, reason: error.message };
  }
}

const getBlockchainDonationData = getDonationFromTx;

module.exports = {
  recordDonationOnChain,
  getDonationFromChain,
  getDonationFromTx,
  getBlockchainDonationData,
};
