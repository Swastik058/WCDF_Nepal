// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationLedger {

    event DonationRecorded(
        uint256 donationId,
        uint256 amount,
        uint256 timestamp
    );

    function recordDonation(uint256 donationId, uint256 amount) public {
        emit DonationRecorded(donationId, amount, block.timestamp);
    }
}
