const mongoose = require("mongoose");

// ✅ CONSTANT: Shared Categories List (Consistent with PaperPattern)
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

const questionSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. HIERARCHY (Standard)
    // ==========================================
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

    // ==========================================
    // 2. TYPES & CATEGORIES (UPDATED ✅)
    // ==========================================
    type: {
      type: String,
      enum: ["MCQ", "SHORT", "LONG"],
      required: true,
    },

    // 🔥 CHANGED: String -> [String] (Array)
    questionCategory: {
      type: [String],
      enum: QUESTION_CATEGORIES,
      default: ["TEXT"], // Default ab array hoga
      index: true, // Filtering k liye fast hoga
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // ==========================================
    // 3. MAIN CONTENT (Dual Medium)
    // ==========================================
    statement: {
      en: { type: String },
      ur: { type: String },
    },

    // ✅ 4. FLEXIBLE DATA (For Complex Language Qs)
    questionData: {
      // Poetry Specific
      poetName: { en: String, ur: String },
      poemName: { en: String, ur: String },

      // Prose/Lesson Specific
      authorName: { en: String, ur: String },
      lessonTitle: { en: String, ur: String },

      // Comparison / Pairs
      itemA: { type: String },
      itemB: { type: String },

      // Large Text Context
      contextPassage: { en: String, ur: String },
    },

    // 5. Options (For MCQs)
    options: [
      {
        en: { type: String },
        ur: { type: String },
        isCorrect: { type: Boolean, default: false },
      },
    ],

    // 6. Media & Metadata
    image: {
      url: String,
      public_id: String,
    },
    marks: { type: Number, default: 1 },
    important: { type: Boolean, default: false },
    boardTags: [String],

    // ==========================================
    // 7. AI & SEARCH
    // ==========================================
    vector_embedding: {
      type: [Number],
      select: false,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
