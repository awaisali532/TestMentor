const mongoose = require("mongoose");

const SavedPaperSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    totalMarks: { type: Number, required: true },

    // Meta Data
    examLabel: { type: String, default: "" },
    syllabusLabel: { type: String, default: "Full Book" },
    paperPattern: { type: Object, required: true },
    examDate: { type: Date },

    // ✅ QUESTIONS (SNAPSHOT STRATEGY)
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }, // Reference only
        type: { type: String, enum: ["MCQ", "SHORT", "LONG"] },
        statement: {
          en: { type: String, default: "" },
          ur: { type: String, default: "" },
        },
        options: [
          {
            en: { type: String, default: "" },
            ur: { type: String, default: "" },
            isCorrect: { type: Boolean, default: false }, // ✅ FIX: Added isCorrect
          },
        ],
        marks: Number,
        tabId: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SavedPaper || mongoose.model("SavedPaper", SavedPaperSchema);
