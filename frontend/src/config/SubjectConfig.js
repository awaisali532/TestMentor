export const SUBJECT_CATEGORIES = {
  // --- LANGUAGES ---
  English: [
    { value: "TEXT", label: "General / Text Question" }, // Default for MCQs/Short
    { value: "EXERCISE", label: "Book Exercise Question" },
    { value: "PAIR_OF_WORDS", label: "Pair of Words" },
    { value: "IDIOMS", label: "Idioms / Phrasal Verbs" },
    { value: "POETRY", label: "Stanza / Poem Summary" },
    { value: "TRANSLATION", label: "Translation Paragraph" },
    { value: "GRAMMAR", label: "Direct/Indirect (Grammar)" },
    { value: "ESSAY", label: "Essay / Letter Topic" },
  ],
  Urdu: [
    { value: "TEXT", label: "Sawal Jawab (General)" },
    { value: "EXERCISE", label: "Mashqi Sawal (Exercise)" },
    { value: "POETRY", label: "Ash'aar / Tashreeh" },
    { value: "WORD_MEANING", label: "Alfaz Maani / Jumlay" },
    { value: "PASSAGE", label: "Nasr Para / Iqtibas" },
    { value: "GRAMMAR", label: "Qawaid (Grammar)" },
  ],
  Islamiyat: [
    { value: "TEXT", label: "General Question" },
    { value: "EXERCISE", label: "Mashqi Sawal (Exercise)" },
    { value: "TRANSLATION", label: "Ayah/Hadith Tarjuma" },
  ],
  "Tarjama-tul-Quran": [
    { value: "TEXT", label: "General Question" },
    { value: "EXERCISE", label: "Mashqi Sawal (Exercise)" },
    { value: "WORD_MEANING", label: "Quranic Words (Alfaz Maani)" },
    { value: "TRANSLATION", label: "Ayah Tarjuma" },
  ],

  // --- SCIENCE ---
  default: [
    { value: "TEXT", label: "Theory Question" },
    { value: "EXERCISE", label: "Book Exercise Question" },
    { value: "NUMERICAL", label: "Numerical / Problem" },
    { value: "DIAGRAM", label: "Diagram Labeling" },
    { value: "Examples", label: "Examples" },
    { value: "REVIEW", label: "Review Questions" },
    { value: "CONCEPTUAL", label: "Conceptual / Side Box" },
  ],
};

export const getCategoriesForSubject = (subjectName) => {
  const key = Object.keys(SUBJECT_CATEGORIES).find((k) =>
    subjectName.includes(k)
  );
  return SUBJECT_CATEGORIES[key] || SUBJECT_CATEGORIES["default"];
};

export const shouldShowStatementBox = (category) => {
  const hideFor = ["PAIR_OF_WORDS", "IDIOMS", "WORD_MEANING"];
  return !hideFor.includes(category);
};
