const mongoose = require("mongoose");

// ✅ CENTRALIZED CATEGORIES LIST
const QUESTION_CATEGORIES = [
  "ANY",
  "TEXT",
  "EXERCISE",
  "MCQ_GENERAL",
  "NUMERICAL",
  "THEORY",
  "CONCEPTUAL",
  "DIAGRAM",
  "THEOREM",
  "SUMMARY",
  "ESSAY",
  "LETTER",
  "STORY",
  "TRANSLATION",
  "POETRY",
  "IDIOMS",
  "PAIR_OF_WORDS",
  "CHANGE_OF_VOICE",
  "GRAMMAR",
  "COMPREHENSION",
  "STANZA",
  "REVIEW",
];

// =========================================================
// 1. SUB-QUESTION SCHEMA
// =========================================================
const SubQuestionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  questionCategory: {
    type: String,
    enum: QUESTION_CATEGORIES,
    default: "THEORY",
  },
  marks: { type: Number, required: true },
  linkedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
});

// =========================================================
// 2. SECTION SCHEMA
// =========================================================
const SectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, default: "Section I" },
  questionNo: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["MCQ", "SHORT", "LONG"],
    required: true,
  },
  questionCategory: {
    type: String,
    enum: QUESTION_CATEGORIES,
    default: "TEXT",
  },
  totalQuestions: { type: Number, required: true },
  toAttempt: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },
  isCompulsory: { type: Boolean, default: false },
  linkedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  hasParts: { type: Boolean, default: false },
  subQuestions: [SubQuestionSchema],
  instructionText: { type: String, default: "" },
});

// =========================================================
// 3. PAPER PATTERN SCHEMA
// =========================================================
const PaperPatternSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pattern Name is required"],
      trim: true,
    },

    // ✅ NEW FIELD: Pattern Category (For Filtering)
    category: {
      type: String,
      enum: ["FULL_BOOK", "HALF_BOOK", "CHAPTER_WISE", "GENERAL"],
      default: "GENERAL",
    },

    gradeLevel: {
      type: String,
      required: true,
      enum: ["9th", "10th", "11th", "12th"],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    totalMarks: { type: Number, required: true },
    timeAllowed: { type: String, default: "2:00 Hours" },
    isPairingSpecific: { type: Boolean, default: false },
    longQAttemptCount: { type: Number, default: 0 },
    sections: [SectionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSystemPreset: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaperPattern", PaperPatternSchema);
