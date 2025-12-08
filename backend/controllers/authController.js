const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// --- REGISTER (FIXED: Now with Encryption) ---
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

    // 🔒 SECURITY FIX: Encrypt the Password!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validate Role
    let userRole = "student";
    if (role === "teacher") userRole = "teacher";

    // Create User with HASHED Password
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // <--- SAVING THE HASH, NOT PLAIN TEXT
      role: userRole,
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

// --- LOGIN (Standard Check) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 🔒 COMPARE: Plain Input vs Database Hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
