const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapterNumber: { type: Number, required: true }, // e.g., 1

    name: {
      en: { type: String, trim: true, default: "" },
      ur: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

// Require at least one language name
chapterSchema.pre("validate", function () {
  if (!this.name?.en?.trim() && !this.name?.ur?.trim()) {
    this.invalidate("name", "Either English or Urdu chapter name is required");
  }
});

// Prevent duplicate chapter numbers in the same subject
chapterSchema.index({ subject: 1, chapterNumber: 1 }, { unique: true });

// Check if model exists before compiling (Fixes the overwrite error)
module.exports =
  mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema);
