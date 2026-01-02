const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// --- HELPER 1: Token Generator ---
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      planType: user.planType,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// --- HELPER 2: Verification Email Template (Green) ---
const generateEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #3ca8a0; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">TestMentor Security</h2>
      </div>
      
      <div style="padding: 30px; color: #333333;">
        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          You requested to verify your account. Please use the OTP below to complete the process.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3ca8a0; background-color: #f0fdfc; padding: 15px 30px; border-radius: 8px; border: 2px dashed #3ca8a0;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #666;">
          This code is valid for <strong>10 minutes</strong>. <br/>
          If you did not request this, please ignore this email.
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} TestMentor. All rights reserved.
      </div>
    </div>
  `;
};

// --- HELPER 3: Reset Password Template (Red) ---
const generateResetTemplate = (name, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #dc3545; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset</h2>
      </div>
      
      <div style="padding: 30px; color: #333333;">
        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          We received a request to reset your password. Use the OTP below to set a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc3545; background-color: #fff5f5; padding: 15px 30px; border-radius: 8px; border: 2px dashed #dc3545;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #666;">
          This code is valid for <strong>10 minutes</strong>. <br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} TestMentor. All rights reserved.
      </div>
    </div>
  `;
};

// ==================================================
// 1. REGISTER USER
// ==================================================
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

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

      // Increment Attempts
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      if (user.otpAttempts >= 3) {
        user.blockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 Mins Block
        user.otpAttempts = 0;
        await user.save();
        return res.status(429).json({
          success: false,
          message: "Too many requests. Blocked for 15 mins.",
        });
      }

      // Update Info
      user.name = name;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // New User
      user = await User.create({
        name,
        email,
        password,
        role: "user",
        planType: "free",
        isVerified: false,
        otp,
        otpExpires,
        otpAttempts: 1,
      });
    }

    // ✅ Use Green Template Here
    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Account - TestMentor",
        html: generateEmailTemplate(user.name, otp),
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
      return res.status(400).json({
        success: false,
        message: "User already verified. Please login.",
      });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({
        success: false,
        message: "OTP Expired. Please request a new one.",
      });

    // Success: Reset & Verify
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
        .json({ success: false, message: "Account already verified." });

    // Check Block
    if (user.blockUntil && user.blockUntil > Date.now()) {
      const timeLeft = Math.ceil((user.blockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many attempts! Wait ${timeLeft} mins.`,
      });
    }

    // Increment Attempts
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    if (user.otpAttempts >= 3) {
      user.blockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Blocked for 15 mins.",
      });
    }

    // Generate New OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // ✅ Use Green Template Here
    try {
      await sendEmail({
        to: email,
        subject: "Resend OTP - TestMentor",
        html: generateEmailTemplate(user.name, otp),
        from: "TestMentor Security",
      });

      res
        .status(200)
        .json({ success: true, message: "New OTP sent successfully." });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Email failed to send." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ==================================================
// 4. LOGIN
// ==================================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ✅ Specific Error: User Not Found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found! Please register first.",
      });
    }

    // ✅ Specific Check: Unverified User
    if (!user.isVerified) {
      // Send OTP automatically
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendEmail({
          to: email,
          subject: "Verify Your Account - TestMentor",
          html: generateEmailTemplate(user.name, otp),
          from: "TestMentor Security",
        });
      } catch (err) {
        console.error("Login OTP Send Failed", err);
      }

      return res.status(401).json({
        success: false,
        message: "Email not verified. A new OTP has been sent to your inbox.",
        notVerified: true,
        email: user.email,
      });
    }

    // ✅ Specific Check: Banned User
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended by Admin. Contact support.",
      });
    }

    // ✅ Specific Check: Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials / Wrong Password.",
      });
    }

    // Login Success
    const token = generateToken(user);

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
        permissions: user.permissions || [],
        resume: user.resume || "",
        planType: user.planType,
        usage: user.usage,
        subscription: user.subscription,
        institute: user.institute || {
          name: "",
          address: "",
          phone: "",
          logo: "",
        },
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: err.message,
    });
  }
};

// ==================================================
// 5. FORGOT PASSWORD (Send Red OTP)
// ==================================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Mins
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: "Reset Password Request - TestMentor",
        html: generateResetTemplate(user.name, otp), // ✅ Use Red Template
        from: "TestMentor Security",
      });

      res
        .status(200)
        .json({ success: true, message: "OTP sent to your email." });
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res
        .status(500)
        .json({ success: false, message: "Email could not be sent." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
// ==================================================
// 6. RESET PASSWORD (Verify OTP & Change Pass)
// ==================================================
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // 1. Verify OTP
    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code." });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ✅ 2. NEW CHECK: Check against Old Password
    // Hum 'matchPassword' method use karenge jo User model mein bana hua hai
    const isSamePassword = await user.matchPassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password cannot be the same as your old password. Please choose a different one.",
      });
    }

    // 3. Update Password
    // (Mongoose ka pre-save hook isay khud Hash kar dega)
    user.password = newPassword;

    // 4. Clear OTP fields (Cleanup)
    user.otp = undefined;
    user.otpExpires = undefined;

    // 5. Reset Block/Attempts (Optional but good practice)
    user.otpAttempts = 0;
    user.blockUntil = null;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful! You can now login with your new password.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during password reset." });
  }
};
// ... (Baki functions same rahenge)

// ==================================================
// 7. VALIDATE OTP (For Forgot Password Step 2)
// ==================================================
exports.validateResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check match
    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code." });
    }

    // Check expiry
    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Code has expired. Please request a new one.",
        });
    }

    // ✅ Agar sab sahi hai, to Success bhejo (Lekin OTP delete mat karna abhi)
    res
      .status(200)
      .json({
        success: true,
        message: "OTP Verified. Proceed to reset password.",
      });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
