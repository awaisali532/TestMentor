const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// --- REGISTER ---
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Block Admin Email Registration (Security)
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

    // Validate Role
    let userRole = "student";
    if (role === "teacher") userRole = "teacher";

    // ✅ FIX: Do NOT hash password here. The User Model will do it automatically.
    const user = await User.create({
      name,
      email,
      password, // Send plain password, Model will encrypt it
      role: userRole,
      image: "", // Default empty image
    });

    res
      .status(201)
      .json({ success: true, message: "Registered successfully!" });
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

    // ✅ 2. CHECK IF BANNED
    if (user.isActive === false) {
      return res
        .status(403)
        .json({ message: "You are banned by Admin! Contact support." });
    }

    // 🔒 COMPARE
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Password" });
    }

    // JWT Token Generation
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      // ✅ THIS IS PERFECT: Sending image back on login
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        resume: user.resume,
        image: user.image || "",
        isSuperAdmin: user.isSuperAdmin || false,
        permissions: user.permissions || [],
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
