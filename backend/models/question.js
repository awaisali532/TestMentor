const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // 1. Hierarchy
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
      },
    ],
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classLevel: { type: String, required: true },

    // 2. Question Types & Category
    type: {
      type: String,
      enum: ["MCQ", "SHORT", "LONG"],
      required: true,
    },
    questionCategory: {
      type: String,
      enum: [
        "TEXT",
        "EXERCISE",
        "EXAMPLE",
        "NUMERICAL",
        "REVIEW",
        "CONCEPTUAL",
      ],
      default: "TEXT",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // 3. Content (Dual Medium)
    statement: {
      en: { type: String },
      ur: { type: String },
    },
    image: {
      url: String,
      public_id: String,
    },

    // 4. Options (For MCQs)
    options: [
      {
        en: { type: String },
        ur: { type: String },
        isCorrect: { type: Boolean, default: false },
      },
    ],

    // 5. Metadata
    marks: { type: Number, default: 1 },
    important: { type: Boolean, default: false },
    boardTags: [String],

    // ✅ 6. AI Vector Field (NEW)
    vector_embedding: {
      type: [Number], // Array of numbers to store the vector
      select: false, // Optional: Normal queries me ye heavy data load na ho (Speed k liye)
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
