const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    className: { type: String, required: true }, // e.g., "9th"
    subjectName: { type: String, required: true }, // e.g., "Physics"
    year: { type: String, required: true },

    // Image ko object banao taaki URL aur ID dono save ho sakein
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }, // Cloudinary se delete karne ke liye zaroori hai
    },
  },
  { timestamps: true }
);

// Yeh line duplicates rokegi (Ek class mein same subject do dafa nahi aayega)
subjectSchema.index({ className: 1, subjectName: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
