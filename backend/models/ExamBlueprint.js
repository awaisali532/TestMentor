const mongoose = require("mongoose");

// --- SECTION SCHEMA (Ek hissa, e.g., Short Questions) ---
const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Section title is required"], // Error handling message
  },

  // Sawal kis type ka hai?
  questionType: {
    type: String,
    enum: ["MCQ", "SHORT", "LONG", "THEORY", "COMPULSORY"], // COMPULSORY for Math Theorem
    required: true,
  },

  // Database se kis category ke sawal uthane hain? (Optional)
  // e.g., 'POEM', 'ALGEBRA', 'GRAMMAR'
  questionCategory: { type: String, default: null },

  // Quantity Logic
  totalQuestions: { type: Number, required: true }, // Kitne show honge (e.g., 12)
  toBeAttempted: { type: Number, required: true }, // Kitne karne hain (e.g., 8)
  marksPerQuestion: { type: Number, required: true }, // e.g., 2 or 8

  // Long Questions Specifics (Parts A & B)
  hasParts: { type: Boolean, default: false },
  partsCount: { type: Number, default: 0 }, // e.g., 2 parts

  // Custom Choice Text (e.g., "Attempt any 5 questions")
  instructionText: { type: String, default: "" },
});

// --- MAIN BLUEPRINT SCHEMA ---
const ExamBlueprintSchema = new mongoose.Schema(
  {
    // Unique Name
    presetName: {
      type: String,
      required: [true, "Preset name is required"],
      unique: true,
      trim: true,
    },

    // Linking (Kis class aur subject ke liye hai)
    gradeLevel: [{ type: String, required: true }], // e.g., ["9th", "10th"]
    subjects: [{ type: String, required: true }], // e.g., ["Physics", "Chemistry"]

    // Type Filter
    type: {
      type: String,
      enum: ["FULL_BOOK", "HALF_BOOK", "CHAPTER_WISE", "CUSTOM"],
      default: "FULL_BOOK",
    },

    totalMarks: { type: Number, required: true },
    timeAllowed: { type: String, default: "2:00 Hours" },

    // Sections Array
    sections: [SectionSchema],

    // Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSystemPreset: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamBlueprint", ExamBlueprintSchema);
