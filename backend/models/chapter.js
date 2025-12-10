const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject", // Subject model se link kiya
      required: true,
    },
    chapterNumber: { type: Number, required: true }, // e.g., 1
    name: { type: String, required: true, trim: true }, // e.g., "Measurements"
    description: { type: String }, // Optional detail
  },
  { timestamps: true }
);

// Ek Subject mein Chapter Number duplicate na ho (e.g. Physics 9th mein Chapter 1 do dafa na aye)
chapterSchema.index({ subject: 1, chapterNumber: 1 }, { unique: true });

module.exports =
  mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema);
