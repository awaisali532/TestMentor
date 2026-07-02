// src/config/SubjectFilterRules.js

export const SUBJECT_RULES = {
  // 🔥 Physics Rules (Strict Separation)
  Physics: {
    TEXT: {
      excludeTags: ["NUMERICAL", "E"],
      includeTags: ["TEXT", "EXERCISE", "CONCEPTUAL"],
    },
    NUMERICAL: {
      mustHave: ["NUMERICAL"],
    },
  },

  // 🌿 Biology (No Numericals usually)
  Biology: {
    TEXT: {
      excludeTags: [],
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
