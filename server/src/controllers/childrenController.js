const mongoose = require("mongoose");
const Child = require("../models/admin/Child");

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const diffMs = Date.now() - birthDate.getTime();
  return Math.floor(diffMs / 31557600000);
};

const buildPublicChild = (child) => ({
  id: child._id,
  name: child.name || child.fullName,
  fullName: child.fullName,
  description: child.description || child.shortBio,
  gender: child.gender,
  image: child.image || child.profileImage,
  profileImage: child.profileImage,
  yearlyCost: child.yearlyCost || 0,
  costBreakdown: child.costBreakdown || {
    education: 0,
    food: 0,
    healthcare: 0,
    shelter: 0,
    others: 0,
  },
  isSponsored: Boolean(child.isSponsored),
  shortBio: child.shortBio,
  interests: child.interests,
  joinedYear: child.joinedYear,
  slug: child.slug,
  age: child.age ?? calculateAge(child.dateOfBirth),
  createdAt: child.createdAt,
  updatedAt: child.updatedAt,
});

exports.getPublicChildren = async (req, res) => {
  try {
    const children = await Child.find({
      $and: [
        { $or: [{ status: "active" }, { status: { $exists: false } }] },
        { $or: [{ isPublished: true }, { isPublished: { $exists: false } }] },
      ],
    })
      .sort({ createdAt: -1 })
      .select("name fullName age gender image profileImage description shortBio yearlyCost costBreakdown isSponsored interests joinedYear slug dateOfBirth createdAt updatedAt")
      .lean();

    return res.status(200).json({
      children: children.map(buildPublicChild),
    });
  } catch (error) {
    console.error("Public children fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch public children" });
  }
};

exports.getPublicChild = async (req, res) => {
  try {
    const { identifier } = req.params;
    const filter = {
      $and: [
        { $or: [{ status: "active" }, { status: { $exists: false } }] },
        { $or: [{ isPublished: true }, { isPublished: { $exists: false } }] },
      ],
    };

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter.$or = [{ _id: identifier }, { slug: identifier }];
    } else {
      filter.slug = identifier;
    }

    const child = await Child.findOne(filter)
      .select("name fullName age gender image profileImage description shortBio yearlyCost costBreakdown isSponsored interests joinedYear slug dateOfBirth createdAt updatedAt")
      .lean();

    if (!child) {
      return res.status(404).json({ message: "Child not found or not published" });
    }

    return res.status(200).json({ child: buildPublicChild(child) });
  } catch (error) {
    console.error("Public child fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch child profile" });
  }
};
