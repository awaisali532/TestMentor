const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // --- Basic Info ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    resume: { type: String, default: "" }, // For Admins/Staff

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

    // --- NEW: Freemium Plan Logic ---
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

    // Subscription Info (For Paid Users)
    subscription: {
      status: { type: Boolean, default: false },
      validUntil: { type: Date, default: null },
    },

    // --- NEW: INSTITUTE SETTINGS (For Paper Header) ---
    institute: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      logo: { type: String, default: "" }, // Cloudinary URL
    },

    // --- Site Settings (For Super Admin Only) ---
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
