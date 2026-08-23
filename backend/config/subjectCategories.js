// =========================================================
// BACKEND MASTER SUBJECT-CATEGORY CONFIGURATION
// Single Source of Truth for Question Categories across Subjects
// =========================================================

const SUBJECT_CATEGORIES = {
  // --- LANGUAGES (English) ---
  English: [
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "General / Text Question" },
    { value: "EXERCISE", label: "Book Exercise Question" },
    { value: "PAIR_OF_WORDS", label: "Pair of Words" },
    { value: "IDIOMS", label: "Idioms / Phrasal Verbs" },
    { value: "POETRY", label: "Stanza / Poem Summary" },
    { value: "TRANSLATION", label: "Translation Paragraph" },
    { value: "GRAMMAR", label: "Direct/Indirect (Grammar)" },
    { value: "ESSAY", label: "Essay / Letter / Story" },
    { value: "COMPREHENSION", label: "Comprehension Passage" },
  ],

  // --- LANGUAGES (Urdu) ---
  Urdu: [
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "Sawal Jawab (General)" },
    { value: "EXERCISE", label: "Mashqi Sawal (Exercise)" },
    { value: "POETRY", label: "Ash'aar / Tashreeh" },
    { value: "WORD_MEANING", label: "Alfaz Maani / Jumlay" },
    { value: "PASSAGE", label: "Nasr Para / Iqtibas" },
    { value: "GRAMMAR", label: "Qawaid (Grammar)" },
    { value: "ESSAY", label: "Mazmoon / Khat / Kahani" },
  ],

  // --- ISLAMIYAT ---
  Islamiyat: [
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "General Question" },
    { value: "EXERCISE", label: "Mashqi Sawal (Exercise)" },
    { value: "TRANSLATION", label: "Ayah/Hadith Tarjuma" },
    { value: "LONG_Q", label: "Tafseeli Sawal" },
  ],

  // --- MATHEMATICS ---
  Mathematics: [
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "Definition / Short Question" },
    { value: "EXERCISE", label: "Exercise Question (Solution)" },
    { value: "THEOREM", label: "Theorem (Masla)" },
    { value: "REVIEW", label: "Review Exercise" },
  ],

  // --- SCIENCE (Physics, Chemistry, Biology, Computer Science, etc.) ---
  default: [
    { value: "TEXT", label: "Theory / Text Question" },
    { value: "EXERCISE", label: "Book Exercise Question" },
    { value: "NUMERICAL", label: "Numerical / Problem" },
    { value: "DIAGRAM", label: "Diagram / Labeling" },
    { value: "CONCEPTUAL", label: "Conceptual / Side Box" },
    { value: "EXAMPLE", label: "Example / Numericals" },
    { value: "REVIEW", label: "Review Exercise" },
  ],
};

// Master set of all valid category string codes
const ALL_CATEGORY_VALUES = new Set();
Object.values(SUBJECT_CATEGORIES).forEach((catList) => {
  catList.forEach((item) => ALL_CATEGORY_VALUES.add(item.value));
});
ALL_CATEGORY_VALUES.add("ANY");

const VALID_CATEGORIES = Array.from(ALL_CATEGORY_VALUES);

// Helper function to resolve category list for a given subject name
const getCategoriesForSubjectName = (subjectName) => {
  if (!subjectName) return SUBJECT_CATEGORIES["default"];

  const nameLower = subjectName.toLowerCase().trim();

  if (nameLower.includes("math")) return SUBJECT_CATEGORIES["Mathematics"];
  if (nameLower.includes("eng")) return SUBJECT_CATEGORIES["English"];
  if (nameLower.includes("urdu")) return SUBJECT_CATEGORIES["Urdu"];
  if (nameLower.includes("islam") || nameLower.includes("isl"))
    return SUBJECT_CATEGORIES["Islamiyat"];

  const key = Object.keys(SUBJECT_CATEGORIES).find((k) =>
    nameLower.includes(k.toLowerCase())
  );

  return SUBJECT_CATEGORIES[key] || SUBJECT_CATEGORIES["default"];
};

module.exports = {
  SUBJECT_CATEGORIES,
  VALID_CATEGORIES,
  getCategoriesForSubjectName,
};
