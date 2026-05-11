const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    resume: { type: String, default: "" },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Not Specified"], // Sirf ye values allow hongi
      default: "Not Specified", // Agar koi user gender na bataye to ye save hoga
      required: true,
    },

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
    canAccessPracticeMode: {
      type: Boolean,
      default: false,
    },

    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    otpAttempts: { type: Number, default: 0 },
    blockUntil: { type: Date, default: null },

    planType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },

    usage: {
      papersGenerated: { type: Number, default: 0 },
      onlineTestsTaken: { type: Number, default: 0 },
      customPaperLimit: { type: Number, default: null },
    },

    subscription: {
      status: { type: Boolean, default: false },
      validUntil: { type: Date, default: null },
    },

    institute: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      logo: { type: String, default: "" },
    },

    businessInfo: {
      phone: { type: String, default: "+92 300 1234567" },
      officeAddress: { type: String, default: "Lahore, Pakistan" },
      supportEmail: { type: String, default: "support@testmentor.com" },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
