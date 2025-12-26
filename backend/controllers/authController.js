const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// --- REGISTER (Public Signups) ---
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (email.toLowerCase() === "admin@testmentor.com") {
      return res
        .status(403)
        .json({ success: false, message: "Reserved email." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      planType: "free",
      image: "",
      // Institute default empty initialize hoga schema se
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully! You are on the Free Plan.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        planType: user.planType,
        institute: user.institute, // ✅ Added for consistency
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// --- LOGIN (Admin & User) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (user.isActive === false) {
      return res
        .status(403)
        .json({ message: "You are banned by Admin! Contact support." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        planType: user.planType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ RESPONSE WITH FULL PROFILE (Institute Added)
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

        // 👇 YE LINE BOHT ZAROORI HAI (Is se Logo/Name Frontend par jayega)
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
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
