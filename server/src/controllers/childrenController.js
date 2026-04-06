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
  fullName: child.fullName,
  gender: child.gender,
  profileImage: child.profileImage,
  shortBio: child.shortBio,
  interests: child.interests,
  joinedYear: child.joinedYear,
  slug: child.slug,
  age: calculateAge(child.dateOfBirth),
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
      .select("fullName gender profileImage shortBio interests joinedYear slug dateOfBirth createdAt updatedAt")
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
      .select("fullName gender profileImage shortBio interests joinedYear slug dateOfBirth createdAt updatedAt")
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
