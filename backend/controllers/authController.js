const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
// ✅ Import Templates
const {
  generateVerificationTemplate,
  generateResetTemplate,
} = require("../utils/emailTemplates");

// --- HELPER: Token Generator ---
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      planType: user.planType,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// ==================================================
// 1. REGISTER USER
// ==================================================
exports.register = async (req, res) => {
  const { name, email, password, gender } = req.body;

  try {
    if (email.toLowerCase() === "admin@testmentor.com") {
      return res
        .status(403)
        .json({ success: false, message: "Reserved email." });
    }

    let user = await User.findOne({ email });

    // Check Limits
    if (user && user.blockUntil && user.blockUntil > Date.now()) {
      const timeLeft = Math.ceil((user.blockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many attempts! Please try again after ${timeLeft} minutes.`,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      if (user.isVerified) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      user.otpAttempts = (user.otpAttempts || 0) + 1;
      if (user.otpAttempts >= 3) {
        user.blockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save();
        return res.status(429).json({
          success: false,
          message: "Too many requests. Blocked for 15 mins.",
        });
      }

      user.name = name;
      user.password = password;
      user.gender = gender; // Update Gender if re-registering
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password,
        gender, // Save Gender
        role: "user",
        planType: "free",
        isVerified: false,
        otp,
        otpExpires,
        otpAttempts: 1,
      });
    }

    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Account - TestMentor",
        html: generateVerificationTemplate(user.name, otp),
        from: "TestMentor Security",
      });

      res.status(201).json({
        success: true,
        message: "OTP sent to email.",
        email: user.email,
      });
    } catch (emailError) {
      if (!user.isVerified && (!user.otpAttempts || user.otpAttempts <= 1)) {
        await User.findOneAndDelete({ email });
      }
      return res
        .status(500)
        .json({ success: false, message: "Email sending failed. Try again." });
    }
  } catch (err) {
    console.error("Register Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ==================================================
// 2. VERIFY OTP
// ==================================================
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    if (user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "User already verified." });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP Expired." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.blockUntil = null;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // 🔥 UPDATE 1: Gender yahan bhi bhejein
        gender: user.gender || "Not Specified",
        planType: user.planType,
        institute: user.institute,
      },
    });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================================================
// 3. RESEND OTP
// ==================================================
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    if (user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "Already verified." });

    if (user.blockUntil && user.blockUntil > Date.now()) {
      return res
        .status(429)
        .json({ success: false, message: "Blocked temporarily. Please wait." });
    }

    user.otpAttempts = (user.otpAttempts || 0) + 1;
    if (user.otpAttempts >= 3) {
      user.blockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.otpAttempts = 0;
      await user.save();
      return res
        .status(429)
        .json({ success: false, message: "Blocked for 15 mins." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Resend OTP - TestMentor",
      html: generateVerificationTemplate(user.name, otp),
      from: "TestMentor Security",
    });

    res.status(200).json({ success: true, message: "New OTP sent." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================================================
// 4. LOGIN (MOST IMPORTANT FIX HERE)
// ==================================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendEmail({
          to: email,
          subject: "Verify Account - TestMentor",
          html: generateVerificationTemplate(user.name, otp),
          from: "TestMentor Security",
        });
      } catch (err) {
        console.error("OTP Send Failed", err);
      }

      return res.status(401).json({
        success: false,
        message: "Email not verified. OTP sent.",
        notVerified: true,
        email: user.email,
      });
    }

    if (user.isActive === false)
      return res
        .status(403)
        .json({ success: false, message: "Account suspended." });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    const token = generateToken(user);

    // ✅ SUCCESS RESPONSE
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image || "",
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        // 🔥 UPDATE 2: Gender yahan include kiya hai
        gender: user.gender || "Not Specified",
        permissions: user.permissions || [],
        planType: user.planType,
        usage: user.usage,
        subscription: user.subscription,
        institute: user.institute || {},
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================================================
// 5. GET PROFILE
// ==================================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 NOTE: Kyunke hum pura object bhej rahe hain,
    // Gender automatically ismein shamil hoga.
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==================================================
// 6. FORGOT PASSWORD
// ==================================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: "Reset Password - TestMentor",
        html: generateResetTemplate(user.name, otp),
        from: "TestMentor Security",
      });
      res.status(200).json({ success: true, message: "OTP sent to email." });
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: "Email failed." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================================================
// 7. VALIDATE RESET OTP
// ==================================================
exports.validateResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP Expired." });

    res.status(200).json({ success: true, message: "OTP Verified." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================================================
// 8. RESET PASSWORD
// ==================================================
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP Expired." });

    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword)
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old.",
      });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.blockUntil = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
