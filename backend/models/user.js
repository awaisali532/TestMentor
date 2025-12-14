const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: "" },

    // ✅ NEW: Resume Field (Stores the URL/Path to the PDF)
    resume: { type: String, default: "" },

    // Permissions Logic
    permissions: {
      type: [String],
      default: [], // Stores ["manage_questions", "manage_subjects"] etc.
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
