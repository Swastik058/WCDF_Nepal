const User = require("../models/UserModel");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const generateToken = require("../config/jwtToken");
const sendEmail = require("../utils/sendEmail");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  return userObj;
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    res.status(201).json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= USER LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ADMIN LOGIN =================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    res.json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "No account found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendEmail({
        to: email,
        subject: "Password Reset",
        html: `<p>Reset link valid for 1 hour:</p><a href="${resetUrl}">${resetUrl}</a>`,
      });
    }

    res.json({ message: "Password reset link sent" });

  } catch (err) {
    res.status(500).json({ message: "Failed to send reset link" });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};

// ================= GOOGLE LOGIN =================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString("hex"),
        googleId,
        role: "user",
      });
    }

    res.json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
    });

  } catch (err) {
    res.status(500).json({ message: "Google authentication failed" });
  }
};

// ================= CHANGE PASSWORD =================
const changePassword = async (req, res) => {
  try {
    const { current, next, confirm } = req.body;

    if (!current || !next || !confirm)
      return res.status(400).json({ message: "All fields required" });

    if (next !== confirm)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(current)))
      return res.status(400).json({ message: "Current password incorrect" });

    user.password = next;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    res.json({ user: sanitizeUser(req.user) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  forgotPassword,
  resetPassword,
  googleLogin,
  changePassword,
  getCurrentUserProfile,
};
