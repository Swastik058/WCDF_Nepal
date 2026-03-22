const express = require("express");
const {
  registerUser,
  loginUser,
  loginAdmin,
  forgotPassword,
  resetPassword,
  googleLogin,
  changePassword,
  getCurrentUserProfile,
} = require("../controllers/AuthController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google-login", googleLogin);
router.put("/change-password", protect, changePassword);
router.get("/me", protect, getCurrentUserProfile);

module.exports = router;
