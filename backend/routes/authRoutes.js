const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // ✅ Middleware Added
const checkSubscription = require("../middleware/checkSubscription"); // 👈 Import New Middleware
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  validateResetOTP,
  getProfile, // ✅ New Import
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", validateResetOTP);
router.post("/reset-password", resetPassword);

// ✅ NEW ROUTE: Get Fresh Profile (User Context Sync)
router.get("/profile", protect, checkSubscription, getProfile);

module.exports = router;
