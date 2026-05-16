const jwt = require("jsonwebtoken"); // es model require doesnt work
const User = require("../models/UserModel"); //usermodel doenst work, but this file is used in authcontroller which uses usermodel, so it should work here too. maybe its just vscode intellisense that is broken?

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
  if (req.user.volunteerStatus !== "approved")
    return res.status(403).json({ message: "Approved volunteer access required" });

  next();
};

module.exports = { protect, adminOnly, requireApprovedVolunteer };