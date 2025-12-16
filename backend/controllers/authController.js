const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Ensure filename matches your project

// --- REGISTER ---
exports.register = async (req, res) => {
  // ✅ Removed 'role' from input. Everyone registers as a standard User on Free Plan.
  const { name, email, password } = req.body;

  try {
    // 1. Block Admin Email Registration (Security)
    if (email.toLowerCase() === "admin@testmentor.com") {
      return res
        .status(403)
        .json({ success: false, message: "Reserved email." });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // 3. Create User
    // We do NOT need to pass role or planType.
    // The Model defaults them to role: "user" and planType: "free".
    const user = await User.create({
      name,
      email,
      password, // Model middleware will hash this automatically
      image: "",
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully! You are on the Free Plan.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        planType: user.planType,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    // ✅ 1. CHECK IF BANNED
    if (user.isActive === false) {
      return res
        .status(403)
        .json({ message: "You are banned by Admin! Contact support." });
    }

    // 🔒 2. COMPARE PASSWORD
    // We use the method defined in your User Model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Password" });
    }

    // ✅ 3. JWT Token Generation
    // We include planType in token so we can check limits in middleware easily
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role, // 'user' or 'admin'
        isSuperAdmin: user.isSuperAdmin,
        planType: user.planType, // 'free' or 'paid'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ 4. Response with New Data Structure
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image || "",

        // Roles
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,

        // Permissions & Resume (For Admins)
        permissions: user.permissions || [],
        resume: user.resume || "",

        // 🔥 NEW: Freemium Data (Vital for Dashboard)
        planType: user.planType, // 'free' or 'paid'
        usage: user.usage, // { papersGenerated: 0, onlineTestsTaken: 0 }
        subscription: user.subscription, // { status: false, validUntil: null }
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
