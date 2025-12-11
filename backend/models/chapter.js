const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapterNumber: { type: Number, required: true }, // e.g., 1

    // ✅ UPDATE 1: Name is now an Object (English + Urdu)
    name: {
      en: { type: String, required: true, trim: true }, // English (Required)
      ur: { type: String, trim: true }, // Urdu (Optional)
    },
  },
  { timestamps: true }
);

// Prevent duplicate chapter numbers in the same subject
chapterSchema.index({ subject: 1, chapterNumber: 1 }, { unique: true });

// Check if model exists before compiling (Fixes the overwrite error)
module.exports =
  mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema);
