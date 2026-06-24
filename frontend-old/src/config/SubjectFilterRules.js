// src/config/SubjectFilterRules.js

export const SUBJECT_RULES = {
  // 🔥 Physics Rules (Strict Separation)
  Physics: {
    TEXT: {
      // Rule: Agar TEXT manga hai, to Numerical hargiz nahi hona chahiye
      excludeTags: ["NUMERICAL", "E"],
      // Rule: In sab ko "Theory" mano (Exercise k wo sawal jo numerical nahi hain)
      includeTags: ["TEXT", "EXERCISE", "CONCEPTUAL"],
    },
    NUMERICAL: {
      // Rule: Sirf wo jisme Numerical tag ho
      mustHave: ["NUMERICAL"],
    },
  },

  // 🌿 Biology (No Numericals usually)
  Biology: {
    TEXT: {
      excludeTags: [], // Kuch exclude mat karo
      includeTags: ["TEXT", "EXERCISE", "DIAGRAM", "DESCRIPTIVE"],
    },
  },

  // 🧪 Chemistry (Similar to Physics)
  Chemistry: {
    TEXT: {
      excludeTags: ["NUMERICAL"],
      includeTags: ["TEXT", "EXERCISE", "ORGANIC", "INORGANIC"],
    },
    NUMERICAL: {
      mustHave: ["NUMERICAL"],
    },
  },

  // 💻 Computer Science
  "Computer Science": {
    TEXT: {
      excludeTags: ["PROGRAM", "CODE"],
      includeTags: ["TEXT", "EXERCISE"],
    },
    PRACTICAL: {
      mustHave: ["PROGRAM", "CODE"],
    },
  },
};

// ⚠️ Fallback Rule (Agar Subject match na ho)
export const DEFAULT_RULE = {
  includeTags: ["TEXT", "EXERCISE", "GENERAL"],
  excludeTags: [],
};
