// src/config/bulkQuestionExamples.js

export const BULK_EXAMPLES = {
  // ============================================================
  // 1. SCIENCE (Physics, Chemistry, Biology, Math - LaTeX Support)
  // ============================================================
  Science: `[
  {
    "topics": ["1.1"],
    "type": "MCQ",
    "questionCategory": ["MCQ_GENERAL"],
    "difficulty": "Easy",
    "marks": 1,
    "boardTags": ["LHR-2023"],
    "statement": {
      "en": "The value of gravitational acceleration $g$ near Earth's surface is approximately:",
      "ur": "زمین کی سطح کے قریب گریویٹیشنل ایکسیلیریشن $g$ کی قیمت تقریباً ہے:"
    },
    "options": [
      { "en": "$9.8 ms^{-2}$", "ur": "$9.8 ms^{-2}$", "isCorrect": true },
      { "en": "$10 ms^{-1}$", "ur": "$10 ms^{-1}$", "isCorrect": false },
      { "en": "$1.6 ms^{-2}$", "ur": "$1.6 ms^{-2}$", "isCorrect": false },
      { "en": "$9.8 ms^{-1}$", "ur": "$9.8 ms^{-1}$", "isCorrect": false }
    ]
  },
  {
    "topics": ["1.2"],
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
    "topics": ["1.3"],
    "type": "LONG",
    "questionCategory": ["NUMERICAL"],
    "difficulty": "Hard",
    "marks": 5,
    "important": true,
    "boardTags": ["LHR-2022", "FSD-2023"],
    "statement": {
      "en": "A train starts from rest. It moves through $1km$ in $100s$ with uniform acceleration. What will be its speed at the end of $100s$?",
      "ur": "ایک ٹرین ریسٹ کی حالت سے چلنا شروع کرتی ہے۔ یہ یونیفارم ایکسیلیریشن کے ساتھ $100s$ میں $1km$ کا فاصلہ طے کرتی ہے۔ $100s$ کے بعد اس کی سپیڈ کیا ہوگی؟"
    }
  }
]`,

  // ============================================================
  // 2. URDU (Poetry, Prose, Authors, Grammar)
  // ============================================================
  Urdu: `[
  {
    "topics": ["1.1"],
    "type": "MCQ",
    "questionCategory": ["TEXT"],
    "difficulty": "Easy",
    "marks": 1,
    "statement": {
      "ur": "سبق 'ہجرت نبویؐ' کے مصنف کون ہیں؟"
    },
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
  },
  {
    "topics": ["1.2"],
    "type": "SHORT",
    "questionCategory": ["PAIR_OF_WORDS"],
    "difficulty": "Medium",
    "marks": 2,
    "boardTags": ["LHR-2021"],
    "questionData": {
      "itemA": "مہیب",
      "itemB": "خوفناک / ڈراؤنا"
    }
  },
  {
    "topics": ["1.3"],
    "type": "LONG",
    "questionCategory": ["POETRY"],
    "difficulty": "Hard",
    "marks": 5,
    "important": true,
    "statement": {
      "ur": "کی محمدؐ سے وفا تُو نے تو ہم تیرے ہیں\\nیہ جہاں چیز ہے کیا لوح و قلم تیرے ہیں"
    },
    "questionData": {
      "poetName": { "ur": "علامہ محمد اقبال" },
      "poemName": { "ur": "جواب شکوہ" }
    }
  }
]`,

  // ============================================================
  // 3. ENGLISH (Literature, Grammar, Comprehension, Pairs)
  // ============================================================
  English: `[
  {
    "topics": ["1.1"],
    "type": "MCQ",
    "questionCategory": ["GRAMMAR"],
    "difficulty": "Easy",
    "marks": 1,
    "statement": {
      "en": "Valour is a/an ______ noun."
    },
    "options": [
      { "en": "Abstract", "isCorrect": true },
      { "en": "Material", "isCorrect": false },
      { "en": "Countable", "isCorrect": false },
      { "en": "Proper", "isCorrect": false }
    ]
  },
  {
    "topics": ["1.2"],
    "type": "SHORT",
    "questionCategory": ["PAIR_OF_WORDS"],
    "difficulty": "Medium",
    "marks": 2,
    "boardTags": ["LHR-2022", "GRW-2023"],
    "questionData": {
      "itemA": "Alter",
      "itemB": "Altar"
    }
  },
  {
    "topics": ["1.3"],
    "type": "LONG",
    "questionCategory": ["COMPREHENSION"],
    "difficulty": "Medium",
    "marks": 5,
    "statement": {
      "en": "Read the passage and answer the questions given below."
    },
    "questionData": {
      "contextPassage": {
        "en": "Media helps people to share knowledge of the world. Their feelings and opinions are expressed through it. Media attracts the attention of a very large audience..."
      }
    }
  }
]`,

  // ============================================================
  // 4. ISLAMIYAT / TARJAMA (Translations, Ayahs, Quran)
  // ============================================================
  Islamiyat: `[
  {
    "topics": ["1.1"],
    "type": "MCQ",
    "questionCategory": ["TEXT"],
    "difficulty": "Easy",
    "marks": 1,
    "statement": {
      "ur": "کس غزوہ میں مسلمانوں کو فتح مبین حاصل ہوئی؟"
    },
    "options": [
      { "ur": "غزوہ بدر", "isCorrect": true },
      { "ur": "غزوہ احد", "isCorrect": false },
      { "ur": "غزوہ خندق", "isCorrect": false },
      { "ur": "غزوہ خیبر", "isCorrect": false }
    ]
  },
  {
    "topics": ["1.2"],
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
    "topics": ["1.3"],
    "type": "LONG",
    "questionCategory": ["TEXT"],
    "difficulty": "Hard",
    "marks": 4,
    "boardTags": ["RWP-2020"],
    "statement": {
      "ur": "عقیدہ ختم نبوت پر ایک جامع اور مدلل نوٹ لکھیں۔"
    }
  }
]`,

  // ============================================================
  // 5. DEFAULT GENERAL TEMPLATE (All types demonstration)
  // ============================================================
  Default: `[
  {
    "topics": ["1.1"],
    "type": "MCQ",
    "questionCategory": ["MCQ_GENERAL"],
    "difficulty": "Medium",
    "marks": 1,
    "boardTags": ["LHR-2023"],
    "statement": {
      "en": "Sample Multiple Choice Question?",
      "ur": "نمونہ کثیر الانتخابی سوال؟"
    },
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
    "difficulty": "Easy",
    "marks": 2,
    "statement": {
      "en": "Sample short question statement.",
      "ur": "مختصر سوال کا نمونہ بیان درج کریں۔"
    }
  },
  {
    "topics": ["1.3"],
    "type": "LONG",
    "questionCategory": ["TEXT"],
    "difficulty": "Hard",
    "marks": 5,
    "statement": {
      "en": "Sample detailed long question statement.",
      "ur": "تفصیلی سوال کا نمونہ بیان درج کریں۔"
    }
  }
]`
};

export const getExampleForSubject = (subjectName) => {
  if (!subjectName) return BULK_EXAMPLES.Default;
  const name = subjectName.toLowerCase();

  if (name.includes("english")) return BULK_EXAMPLES.English;
  if (name.includes("urdu")) return BULK_EXAMPLES.Urdu;
  if (
    name.includes("islam") ||
    name.includes("quran") ||
    name.includes("tarjama") ||
    name.includes("arabic") ||
    name.includes("mutalia") ||
    name.includes("pak study")
  ) {
    return BULK_EXAMPLES.Islamiyat;
  }
  if (
    name.includes("math") ||
    name.includes("phys") ||
    name.includes("chem") ||
    name.includes("bio") ||
    name.includes("computer") ||
    name.includes("science")
  ) {
    return BULK_EXAMPLES.Science;
  }

  return BULK_EXAMPLES.Default;
};
