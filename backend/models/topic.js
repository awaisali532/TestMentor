const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    // 1. Link to Chapter (Foreign Key)
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter", // Yeh Chapter Model se juda hua hai
      required: true,
    },

    // 2. Topic Details
    topicNumber: { type: String, required: true }, // e.g., "1.1", "1.2"
    name: { type: String, required: true, trim: true }, // e.g., "Introduction to Physics"
    description: { type: String }, // Optional detail
  },
  { timestamps: true }
);

// 3. Unique Constraint
// Ek Chapter mein "1.1" do dafa nahi ho sakta.
topicSchema.index({ chapter: 1, topicNumber: 1 }, { unique: true });

module.exports = mongoose.model("Topic", topicSchema);
