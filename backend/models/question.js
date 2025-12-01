const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // 1. Hierarchy (Kis class/subject/chapter ka hai)
    classLevel: { type: String, required: true }, // Filter ke liye direct access
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    // 2. Question Details
    type: {
      type: String,
      enum: ["MCQ", "Short", "Long"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // 3. Content (Urdu/Eng/Math mix)
    questionText: { type: String, required: true }, // Isme LaTeX bhi ayega
    image: {
      url: String,
      public_id: String,
    }, // Optional diagram

    // 4. Sirf MCQs ke liye
    options: [
      {
        text: { type: String }, // Option text
        image: { url: String, public_id: String }, // Option mein bhi image ho sakti hai
        isCorrect: { type: Boolean, default: false },
      },
    ],

    // 5. Metadata
    marks: { type: Number, default: 1 },
    important: { type: Boolean, default: false }, // "Guess Paper" ke liye
    boardTag: [String], // e.g. ['Lahore', 'Federal'] - taaki Past Papers bana sako
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
