const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token, authorization denied" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();

  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });

  next();
};

const requireApprovedVolunteer = (req, res, next) => {
  if (req.user.volunteerStatus === "pending") {
    return res.status(403).json({ message: "Volunteer application is still pending" });
  }

  if (req.user.volunteerStatus === "rejected") {
    return res.status(403).json({ message: "Volunteer application was rejected" });
  }

  if (!req.user.isVolunteer || req.user.volunteerStatus !== "approved") {
    return res.status(403).json({ message: "Approved volunteer access required" });
  }

  next();
};

module.exports = { protect, adminOnly, requireApprovedVolunteer };
