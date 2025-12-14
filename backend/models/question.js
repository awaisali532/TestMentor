const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // 1. Hierarchy
    // 🔄 CHANGED: 'topic' is now 'topics' (Array) to support Many-to-Many
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
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
