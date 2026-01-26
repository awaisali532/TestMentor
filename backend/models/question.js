const mongoose = require("mongoose");

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
    // 2. TYPES & CATEGORIES (Updated for Languages)
    // ==========================================
    type: {
      type: String,
      enum: ["MCQ", "SHORT", "LONG"],
      required: true,
    },
    questionCategory: {
      type: String,
      enum: [
        "TEXT", // General Textual Question
        "EXERCISE", // Book Exercise Question
        "NUMERICAL", // Physics/Chem/Math
        "THEORY", // Physics/Bio/Chem (Long)
        "CONCEPTUAL", // Conceptual/Reasoning
        "SUMMARY", // English (Poem Summary)
        "ESSAY", // English/Urdu (Mazmoon)
        "LETTER", // English/Urdu (Khat/Application)
        "STORY", // English/Urdu (Kahani)
        "TRANSLATION", // Paragraph Translation
        "POETRY", // Tashreeh (Nazm/Ghazal)
        "IDIOMS", // Muhawaray / Phrasal Verbs
        "PAIR_OF_WORDS", // English
        "CHANGE_OF_VOICE", // Active/Passive
        "THEOREM", // Math Compulsory
        "COMPREHENSION", // Paragraph questions
        "MCQ_GENERAL", // Standard MCQs
      ],
      default: "TEXT",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // ==========================================
    // 3. MAIN CONTENT (Dual Medium)
    // ==========================================
    // Normal sawalon ke liye yehi use hoga.
    // Rich Text (Bold/Underline) supported via HTML strings.
    statement: {
      en: { type: String },
      ur: { type: String },
    },

    // ✅ 4. FLEXIBLE DATA (For Complex Language Qs)
    // Ye object tab use hoga jab category TEXT ya NUMERICAL nahi hogi.
    questionData: {
      // Poetry Specific
      poetName: { en: String, ur: String }, // Shair ka naam
      poemName: { en: String, ur: String }, // Nazam ka naam

      // Prose/Lesson Specific
      authorName: { en: String, ur: String }, // Musannif ka naam
      lessonTitle: { en: String, ur: String }, // Sabq ka Unwan

      // Comparison / Pairs (Pair of words, Idioms, Word Meanings)
      itemA: { type: String }, // e.g. "Break" (Word)
      itemB: { type: String }, // e.g. "Brake" (Meaning or 2nd Word)

      // Large Text Context (Comprehension Passage / English Paragraph)
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
    boardTags: [String], // e.g. ["LHR-22", "GRW-19"]

    // ==========================================
    // 7. AI & SEARCH
    // ==========================================
    vector_embedding: {
      type: [Number],
      select: false, // Performance ke liye default hidden
      index: true,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
