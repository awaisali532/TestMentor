const mongoose = require("mongoose");

const SavedPaperSchema = new mongoose.Schema(
  {
    // Kis user ne banaya
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Paper Info
    title: { type: String, required: true }, // e.g. "Physics 9th - Mid Term"
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    totalMarks: { type: Number, required: true },

    // Pattern ka Snapshot (Taake agar baad mein pattern change ho to ye paper kharab na ho)
    paperPattern: { type: Object, required: true },

    // Questions ka Snapshot (Text samet save karenge)
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }, // Link for reference
        type: { type: String, enum: ["MCQ", "SHORT", "LONG"] },
        statement: {
          en: String,
          ur: String,
        },
        options: [
          { en: String, ur: String }, // Sirf MCQs k liye
        ],
        marks: Number,
        tabId: String, // Important: Grouping (Q3a, Q3b) isi se hogi
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedPaper", SavedPaperSchema);
