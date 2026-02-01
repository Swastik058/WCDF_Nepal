async function main() {
  const DonationLedger = await ethers.getContractFactory("DonationLedger");
  const donationLedger = await DonationLedger.deploy();

  await donationLedger.waitForDeployment();

  console.log(
    "DonationLedger deployed to:",
    await donationLedger.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
