// src/config/BulkExamples.js

const EXAMPLES = {
  // ============================================================
  // 1. ENGLISH (Literature, Grammar, Pairs)
  // ============================================================
  English: `[
  {
    "topics": ["1.1"], 
    "type": "SHORT", 
    "questionCategory": ["PAIR_OF_WORDS"],
    "difficulty": "Medium",
    "marks": 2,
    "important": true,
    "boardTags": ["LHR-2022", "GRW-2023"],
    "questionData": {
        "itemA": "Alter",
        "itemB": "Altar"
    }
  },
  {
    "topics": ["1.2"], 
    "type": "SHORT", 
    "questionCategory": ["POETRY"],
    "difficulty": "Hard",
    "marks": 2,
    "statement": { "en": "I wandered lonely as a cloud\\nThat floats on high o'er vales and hills..." },
    "questionData": {
        "poetName": { "en": "William Wordsworth" },
        "poemName": { "en": "Daffodils" }
    }
  },
  {
    "topics": ["1.3"], 
    "type": "LONG", 
    "questionCategory": ["COMPREHENSION"],
    "marks": 5,
    "statement": { "en": "Read the passage and answer the questions given below." },
    "questionData": {
        "contextPassage": { "en": "Media helps people to share knowledge of the world. Their feelings and opinions are expressed through it..." }
    }
  },
  {
    "topics": ["1.4"], 
    "type": "MCQ", 
    "questionCategory": ["GRAMMAR"],
    "difficulty": "Easy",
    "marks": 1,
    "statement": { "en": "Valour is a/an ______ noun." },
    "options": [
      { "en": "Abstract", "isCorrect": true },
      { "en": "Material", "isCorrect": false },
      { "en": "Countable", "isCorrect": false },
      { "en": "Proper", "isCorrect": false }
    ]
  }
]`,

  // ============================================================
  // 2. URDU (Poetry, Prose, Authors)
  // ============================================================
  Urdu: `[
  {
    "topics": ["2.1"], 
    "type": "SHORT", 
    "questionCategory": ["PAIR_OF_WORDS"],
    "difficulty": "Easy",
    "marks": 2,
    "boardTags": ["FSD-2021"],
    "questionData": {
        "itemA": "مہیب",
        "itemB": "خوفناک / ڈراؤنا"
    }
  },
  {
    "topics": ["2.2"], 
    "type": "LONG", 
    "questionCategory": ["POETRY"],
    "difficulty": "Hard",
    "marks": 5,
    "important": true,
    "statement": { "ur": "کی محمدؐ سے وفا تُو نے تو ہم تیرے ہیں\\nیہ جہاں چیز ہے کیا لوح و قلم تیرے ہیں" },
    "questionData": {
        "poetName": { "ur": "علامہ اقبال" },
        "poemName": { "ur": "جواب شکوہ" }
    }
  },
  {
    "topics": ["2.3"], 
    "type": "MCQ", 
    "questionCategory": ["TEXT"],
    "marks": 1,
    "statement": { "ur": "سبق 'ہجرت نبویؐ' کے مصنف کون ہیں؟" },
    "questionData": {
        "authorName": { "ur": "مولانا شبلی نعمانی" },
        "lessonTitle": { "ur": "ہجرت نبویؐ" }
    },
    "options": [
      { "ur": "مولانا شبلی نعمانی", "isCorrect": true },
      { "ur": "سر سید احمد خان", "isCorrect": false },
      { "ur": "ڈپٹی نذیر احمد", "isCorrect": false },
      { "ur": "الطاف حسین حالی", "isCorrect": false }
    ]
  }
]`,

  // ============================================================
  // 3. ISLAMIYAT / TARJAMA (Translations, Ayahs)
  // ============================================================
  Islamiyat: `[
  {
    "topics": ["3.1"], 
    "type": "SHORT", 
    "questionCategory": ["TRANSLATION"],
    "difficulty": "Medium",
    "marks": 2,
    "important": true,
    "statement": { 
       "en": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
       "ur": "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔"
    }
  },
  {
    "topics": ["3.2"], 
    "type": "LONG", 
    "questionCategory": ["TEXT"],
    "marks": 4,
    "boardTags": ["RWP-2020"],
    "statement": { "ur": "عقیدہ ختم نبوت پر ایک جامع نوٹ لکھیں۔" }
  },
  {
    "topics": ["3.3"], 
    "type": "MCQ", 
    "questionCategory": ["TEXT"],
    "marks": 1,
    "statement": { "ur": "کس غزوہ میں مسلمانوں کو فتح مبین حاصل ہوئی؟" },
    "options": [
      { "ur": "غزوہ بدر", "isCorrect": true },
      { "ur": "غزوہ احد", "isCorrect": false },
      { "ur": "غزوہ خندق", "isCorrect": false },
      { "ur": "غزوہ خیبر", "isCorrect": false }
    ]
  }
]`,

  // ============================================================
  // 4. SCIENCE (Physics, Chem, Math - Latex Support)
  // ============================================================
  Science: `[
  {
    "topics": ["4.1"], 
    "type": "LONG", 
    "questionCategory": ["NUMERICAL"],
    "difficulty": "Hard",
    "marks": 3,
    "important": true,
    "boardTags": ["LHR-2022"],
    "statement": { 
       "en": "A train starts from rest. It moves through $1km$ in $100s$ with uniform acceleration. What will be its speed at the end of $100s$?",
       "ur": "ایک ٹرین ریسٹ کی حالت سے چلنا شروع کرتی ہے۔ یہ یونیفارم ایکسیلیریشن کے ساتھ $100s$ میں $1km$ کا فاصلہ طے کرتی ہے۔ $100s$ کے بعد اس کی سپیڈ کیا ہوگی؟"
    }
  },
  {
    "topics": ["4.2"], 
    "type": "SHORT", 
    "questionCategory": ["CONCEPTUAL"],
    "difficulty": "Medium",
    "marks": 2,
    "statement": { 
        "en": "Define Momentum and write its SI unit.",
        "ur": "مومنٹم کی تعریف کریں اور اس کا SI یونٹ لکھیں۔"
    }
  },
  {
    "topics": ["4.3"], 
    "type": "MCQ", 
    "questionCategory": ["TEXT"],
    "marks": 1,
    "statement": { "en": "The value of gravitational acceleration $g$ is:" },
    "options": [
      { "en": "$9.8 ms^{-2}$", "isCorrect": true },
      { "en": "$10 ms^{-1}$", "isCorrect": false },
      { "en": "$1.6 ms^{-2}$", "isCorrect": false },
      { "en": "$9.8 ms^{-1}$", "isCorrect": false }
    ]
  }
]`,

  // ============================================================
  // 5. DEFAULT TEMPLATE (Shows all fields)
  // ============================================================
  Default: `[
  {
    "topics": ["1.1"], 
    "type": "MCQ", 
    "questionCategory": ["MCQ_GENERAL"],
    "difficulty": "Medium",
    "marks": 1,
    "important": false,
    "boardTags": ["LHR-2023"],
    "statement": { "en": "Sample Question Statement?", "ur": "نمونہ سوال کا بیان؟" },
    "options": [
      { "en": "Option A", "ur": "آپشن اے", "isCorrect": true },
      { "en": "Option B", "ur": "آپشن بی", "isCorrect": false },
      { "en": "Option C", "ur": "آپشن سی", "isCorrect": false },
      { "en": "Option D", "ur": "آپشن ڈی", "isCorrect": false }
    ]
  },
  {
    "topics": ["1.2"],
    "type": "SHORT",
    "questionCategory": ["TEXT"],
    "marks": 2,
    "statement": { "en": "Define Science.", "ur": "سائنس کی تعریف کریں۔" }
  }
]`,
};

// Helper Function to pick correct example
export const getExampleForSubject = (subjectName) => {
  if (!subjectName) return EXAMPLES.Default;

  // Partial Matching logic
  const name = subjectName.toLowerCase();

  if (name.includes("english")) return EXAMPLES.English;
  if (name.includes("urdu")) return EXAMPLES.Urdu;
  if (
    name.includes("islam") ||
    name.includes("quran") ||
    name.includes("tarjama")
  )
    return EXAMPLES.Islamiyat;
  if (
    name.includes("math") ||
    name.includes("phys") ||
    name.includes("chem") ||
    name.includes("bio") ||
    name.includes("computer")
  )
    return EXAMPLES.Science;

  return EXAMPLES.Default;
};
