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

    // ✅ NEW FIELD
    examLabel: { type: String, default: "" },
    syllabusLabel: { type: String, default: "Full Book" },
    paperPattern: { type: Object, required: true },
    examDate: { type: Date },
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        type: { type: String, enum: ["MCQ", "SHORT", "LONG"] },
        statement: { en: String, ur: String },
        options: [{ en: String, ur: String }],
        marks: Number,
        tabId: String,
      },
    ],
  },
  { timestamps: true }
);

// ✅ FIX: Check if model exists, otherwise create new
module.exports =
  mongoose.models.SavedPaper || mongoose.model("SavedPaper", SavedPaperSchema);
