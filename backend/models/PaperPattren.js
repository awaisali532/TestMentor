const mongoose = require("mongoose");

// ✅ CENTRALIZED CATEGORIES LIST (Taake har jagah same rahay)
const QUESTION_CATEGORIES = [
  "ANY", // Mixed / Random
  "TEXT", // General Short/Text
  "EXERCISE", // Book Exercise
  "MCQ_GENERAL", // Standard MCQs
  "NUMERICAL", // Physics/Chem/Math
  "THEORY", // Long Questions
  "CONCEPTUAL", // Reasoning
  "DIAGRAM", // Drawing/Labeling
  "THEOREM", // Math Masla
  "SUMMARY", // English Poem
  "ESSAY", // Mazmoon
  "LETTER", // Khat/Application
  "STORY", // Kahani
  "TRANSLATION", // Urdu to Eng / Eng to Urdu
  "POETRY", // Tashreeh
  "IDIOMS", // Muhawaray
  "PAIR_OF_WORDS", // Jorey
  "CHANGE_OF_VOICE", // Active/Passive
  "GRAMMAR", // Direct/Indirect etc.
  "COMPREHENSION", // Passage
  "STANZA", // Poem Stanza
  "REVIEW", // Review Exercise
];

// =========================================================
// 1. SUB-QUESTION SCHEMA (For Long Question Parts)
// =========================================================
const SubQuestionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., "a", "b"

  // Specific Category for this part
  questionCategory: {
    type: String,
    enum: QUESTION_CATEGORIES, // ✅ Uses shared list
    default: "THEORY",
  },

  marks: { type: Number, required: true }, // e.g., 4 or 5

  // PAIRING SCHEME FOR PARTS
  linkedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
});

// =========================================================
// 2. SECTION SCHEMA (The Main Question Block)
// =========================================================
const SectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, default: "Section I" }, // Display Name
  questionNo: { type: String, required: true }, // "Q.2", "Q.5"

  questionType: {
    type: String,
    enum: ["MCQ", "SHORT", "LONG"],
    required: true,
  },

  questionCategory: {
    type: String,
    enum: QUESTION_CATEGORIES, // ✅ Uses shared list
    default: "TEXT",
  },

  // --- QUANTITY LOGIC ---
  totalQuestions: { type: Number, required: true },
  toAttempt: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },

  // --- LOGIC FLAGS ---
  // ✅ NEW: Math Theorem waghaira k liye
  isCompulsory: { type: Boolean, default: false },

  // --- PAIRING SCHEME ---
  linkedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],

  // --- LONG QUESTION PARTS ---
  hasParts: { type: Boolean, default: false },
  subQuestions: [SubQuestionSchema],

  instructionText: { type: String, default: "" },
});

// =========================================================
// 3. PAPER PATTERN SCHEMA (The Wrapper)
// =========================================================
const PaperPatternSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pattern Name is required"],
      trim: true,
    },

    // --- METADATA ---
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

    // --- PAIRING MODE FLAG ---
    isPairingSpecific: { type: Boolean, default: false },

    // ✅ NEW: Total Long Questions mein se kitne karne hain?
    // Yeh "Total Marks" calculate karne k liye zaroori hai.
    longQAttemptCount: { type: Number, default: 2 },

    // --- THE SECTIONS ---
    sections: [SectionSchema],

    // --- OWNERSHIP ---
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
