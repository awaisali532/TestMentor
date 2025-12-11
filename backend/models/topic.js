const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    // Link to Chapter
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    // Topic Details
    topicNumber: { type: String, required: true }, // e.g., "1.1"

    // Name (English + Urdu) - No Description
    name: {
      en: { type: String, required: true, trim: true },
      ur: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Unique Constraint (Chapter + Topic Number must be unique)
topicSchema.index({ chapter: 1, topicNumber: 1 }, { unique: true });

module.exports = mongoose.models.Topic || mongoose.model("Topic", topicSchema);
