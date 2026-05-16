const Child = require("../models/admin/Child");
const Notification = require("../models/admin/Notification");
const Sponsorship = require("../models/Sponsorship");

const completeChildSponsorship = async ({ donation, userId }) => {
  if (!donation?.childId || !userId) {
    return null;
  }

  const existingSponsorship = await Sponsorship.findOne({ childId: donation.childId });
  if (existingSponsorship) {
    return existingSponsorship;
  }

  const child = await Child.findOneAndUpdate(
    { _id: donation.childId, isSponsored: false },
    { isSponsored: true, sponsoredBy: userId },
    { new: true }
  );

  if (!child) {
    return Sponsorship.findOne({ childId: donation.childId });
  }

  const sponsorship = await Sponsorship.create({
    childId: child._id,
    userId,
    donationId: donation._id,
    amount: donation.amount,
    sponsoredAt: new Date(),
  });

  await Notification.create({
    message: `Child ${child.name || child.fullName} has been sponsored`,
    childId: child._id,
    userId,
  });

  return sponsorship;
};

module.exports = {
  completeChildSponsorship,
};
