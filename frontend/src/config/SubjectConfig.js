export const SUBJECT_CATEGORIES = {
  // --- LANGUAGES (English) ---
  English: [
    { value: "ANY", label: "Any / Mixed (No Restriction)" },
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
    { value: "ANY", label: "Any / Mixed" },
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
    { value: "ANY", label: "Any / Mixed" },
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "General Question" },
    { value: "EXERCISE", label: "Mashqi Sawal (Exercise)" },
    { value: "TRANSLATION", label: "Ayah/Hadith Tarjuma" },
    { value: "LONG_Q", label: "Tafseeli Sawal" },
  ],

  // --- MATHEMATICS (Special Case) ---
  Mathematics: [
    { value: "ANY", label: "Any / Mixed" },
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "Definition / Short Question" },
    { value: "EXERCISE", label: "Exercise Question (Solution)" },
    { value: "THEOREM", label: "Theorem (Masla)" },
    { value: "REVIEW", label: "Review Exercise" },
  ],

  // --- SCIENCE (Physics, Chem, Bio, Computer) ---
  default: [
    { value: "ANY", label: "Any / Mixed (Text + Exercise + Numerical)" },
    { value: "MCQ_GENERAL", label: "General MCQs" },
    { value: "TEXT", label: "Theory / Text Question" },
    { value: "EXERCISE", label: "Book Exercise Question" },
    { value: "NUMERICAL", label: "Numerical / Problem" },
    { value: "DIAGRAM", label: "Diagram / Labeling" },
    { value: "CONCEPTUAL", label: "Conceptual / Side Box" },
  ],
};

// ✅ Helper 1: Get Categories
export const getCategoriesForSubject = (subjectName) => {
  if (!subjectName) return SUBJECT_CATEGORIES["default"];

  const key = Object.keys(SUBJECT_CATEGORIES).find((k) =>
    subjectName.toLowerCase().includes(k.toLowerCase()),
  );

  if (subjectName.toLowerCase().includes("math"))
    return SUBJECT_CATEGORIES["Mathematics"];

  return SUBJECT_CATEGORIES[key] || SUBJECT_CATEGORIES["default"];
};

// ✅ Helper 2: Should Show Statement Box? (Restored)
// Yeh function Data Entry form mein use hoga taake ghair zaroori inputs chupaye ja sakein.
export const shouldShowStatementBox = (category) => {
  // In categories ke liye "Question Statement" box ki zaroorat nahi hoti
  const hideFor = [
    "PAIR_OF_WORDS",
    "IDIOMS",
    "WORD_MEANING",
    "MCQ_GENERAL", // MCQs ka apna alag structure hota hai
  ];
  return !hideFor.includes(category);
};
