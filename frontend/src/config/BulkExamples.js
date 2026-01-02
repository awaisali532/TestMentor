// src/config/BulkExamples.js

const EXAMPLES = {
  // --- ENGLISH ---
  English: `[
  {
    "topics": ["1.1"], 
    "type": "SHORT", 
    "questionCategory": "PAIR_OF_WORDS",
    "questionData": {
        "itemA": "Break",
        "itemB": "Brake"
    }
  },
  {
    "topics": ["1.2"], 
    "type": "SHORT", 
    "questionCategory": "POETRY",
    "statement": { "en": "I wandered lonely as a cloud..." },
    "questionData": {
        "poetName": { "en": "William Wordsworth" }
    }
  },
  {
    "topics": ["1.3"], 
    "type": "MCQ", 
    "statement": { "en": "He is ___ to school." },
    "options": [
      { "en": "going", "isCorrect": true },
      { "en": "go", "isCorrect": false }
    ]
  }
]`,

  // --- URDU ---
  Urdu: `[
  {
    "topics": ["2.1"], 
    "type": "SHORT", 
    "questionCategory": "WORD_MEANING",
    "questionData": {
        "itemA": "شبنم",
        "itemB": "اوس"
    }
  },
  {
    "topics": ["2.2"], 
    "type": "SHORT", 
    "questionCategory": "POETRY",
    "statement": { "ur": "عمل سے زندگی بنتی ہے جنت بھی جہنم بھی\\nیہ خاکی اپنی فطرت میں نہ نوری ہے نہ ناری ہے" },
    "questionData": {
        "poetName": { "ur": "علامہ اقبال" }
    }
  }
]`,

  // --- ISLAMIYAT / TARJAMA ---
  Islamiyat: `[
  {
    "topics": ["3.1"], 
    "type": "SHORT", 
    "questionCategory": "TRANSLATION",
    "statement": { 
       "en": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
       "ur": "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔"
    }
  },
  {
    "topics": ["3.2"], 
    "type": "MCQ", 
    "statement": { "ur": "توحید کے لغوی معنی کیا ہیں؟" },
    "options": [
      { "ur": "ایک ماننا", "isCorrect": true },
      { "ur": "دو ماننا", "isCorrect": false }
    ]
  }
]`,

  // --- MATH / PHYSICS (Numerical Support) ---
  Science: `[
  {
    "topics": ["4.1"], 
    "type": "NUMERICAL", 
    "statement": { 
       "en": "Calculate force if mass is $10kg$ and acceleration is $5m/s^2$." 
    }
  },
  {
    "topics": ["4.2"], 
    "type": "MCQ", 
    "statement": { "en": "The value of $g$ is approximately:" },
    "options": [
      { "en": "$9.8 m/s^2$", "isCorrect": true },
      { "en": "$100 m/s^2$", "isCorrect": false }
    ]
  }
]`,

  // --- DEFAULT ---
  Default: `[
  {
    "topics": ["1.1"], 
    "type": "MCQ", 
    "statement": { "en": "Sample Question?" },
    "options": [
      { "en": "Option A", "isCorrect": true },
      { "en": "Option B", "isCorrect": false }
    ]
  }
]`,
};

// Helper Function to pick correct example
export const getExampleForSubject = (subjectName) => {
  if (!subjectName) return EXAMPLES.Default;

  // Partial Matching (e.g. "English 9th" matches "English")
  if (subjectName.includes("English")) return EXAMPLES.English;
  if (subjectName.includes("Urdu")) return EXAMPLES.Urdu;
  if (subjectName.includes("Islam") || subjectName.includes("Quran"))
    return EXAMPLES.Islamiyat;
  if (
    subjectName.includes("Math") ||
    subjectName.includes("Phys") ||
    subjectName.includes("Chem")
  )
    return EXAMPLES.Science;

  return EXAMPLES.Default;
};
