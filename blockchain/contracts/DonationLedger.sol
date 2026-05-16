// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationLedger {

    struct Donation {
        uint256 id;
        uint256 amount;    // in paisa (NPR × 100)
        uint256 timestamp; // block.timestamp (Unix seconds)
    }

    uint256 public donationCount;
    mapping(uint256 => Donation) private _donations;

    event DonationRecorded(uint256 indexed id, uint256 amount, uint256 timestamp);

    function recordDonation(uint256 amount) external returns (uint256) {
        donationCount += 1;
        uint256 id = donationCount;
        _donations[id] = Donation(id, amount, block.timestamp);
        emit DonationRecorded(id, amount, block.timestamp);
        return id;
    }

    function getDonation(uint256 id) external view returns (uint256 amount, uint256 timestamp) {
        require(id > 0 && id <= donationCount, "Donation does not exist");
        Donation memory d = _donations[id];
        return (d.amount, d.timestamp);
    }

    function getTotalCount() external view returns (uint256) {
        return donationCount;
    }
}
