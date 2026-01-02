const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyOTP, // ✅ New
  resendOTP, // ✅ New
  forgotPassword, // ✅ New
  resetPassword, // ✅ New
  validateResetOTP,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP); // ✅ Route added
router.post("/resend-otp", resendOTP); // ✅ Route added
// ✅ Password Reset Routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", validateResetOTP); // ✅ NEW ROUTE
router.post("/reset-password", resetPassword);

module.exports = router;
