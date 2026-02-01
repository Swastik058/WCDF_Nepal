const { ethers } = require("ethers");
const abi = require("../../../blockchain/artifacts/contracts/DonationLedger.sol/DonationLedger.json").abi;
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const privateKey = process.env.HARDHAT_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contract = new ethers.Contract(contractAddress, abi, wallet);

async function recordDonationOnChain(donationId, amount) {
  console.log("Recording donation on blockchain:", donationId, amount);

  const tx = await contract.recordDonation(
    BigInt(donationId),
    BigInt(amount)
  );

  await tx.wait();

  console.log("Donation successfully recorded on blockchain");
}

module.exports = { recordDonationOnChain };
