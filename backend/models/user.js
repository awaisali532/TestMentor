const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    resume: { type: String, default: "" },

    // --- Roles & Status ---
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: { type: Boolean, default: true },
    permissions: {
      type: [String],
      default: [],
    },

    // --- ✅ NEW: Email Verification Fields ---
    isVerified: { type: Boolean, default: false }, // Default false (Pending)
    otp: { type: String }, // OTP store hoga
    otpExpires: { type: Date }, // OTP ki expiry time
    // ✅ NEW: Rate Limiting Fields
    otpAttempts: { type: Number, default: 0 }, // Kitni baar OTP manga
    blockUntil: { type: Date, default: null }, // Kab tak blocked hai
    // --- Freemium Plan Logic ---
    planType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },

    // Limits for Free Users
    usage: {
      papersGenerated: { type: Number, default: 0 },
      onlineTestsTaken: { type: Number, default: 0 },
    },

    // Subscription Info
    subscription: {
      status: { type: Boolean, default: false },
      validUntil: { type: Date, default: null },
    },

    // --- INSTITUTE SETTINGS ---
    institute: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      logo: { type: String, default: "" },
    },

    // --- Site Settings (Super Admin) ---
    businessInfo: {
      phone: { type: String, default: "+92 300 1234567" },
      officeAddress: { type: String, default: "Lahore, Pakistan" },
      supportEmail: { type: String, default: "support@testmentor.com" },
    },
  },
  { timestamps: true }
);

// --- Password Hashing Middleware ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Method to Verify Password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
