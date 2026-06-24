// src/utils/questionFilters.js

/**
 * Filters questions based on Topic, Category (String/Array), and Types.
 * * @param {Array} questions - Array of all questions
 * @param {Object} filters - { topicId, category, types }
 * @returns {Array} - Filtered questions
 */
export const filterQuestionsLogic = (
  questions,
  { topicId, category, types },
) => {
  if (!questions || questions.length === 0) return [];

  return questions.filter((q) => {
    // 1. Topic Filter
    if (topicId) {
      // Check if any of the question's topics match the filter ID
      // Handles both populated objects ({_id: '...'}) and raw strings ('...')
      const hasTopic = q.topics?.some((t) => {
        const tId = typeof t === "object" ? t._id : t;
        return tId === topicId;
      });
      if (!hasTopic) return false;
    }

    // 2. Category Filter (Handles Array vs String)
    if (category) {
      if (Array.isArray(q.questionCategory)) {
        // New Schema: ["TEXT", "CONCEPTUAL"]
        if (!q.questionCategory.includes(category)) return false;
      } else {
        // Old Schema: "TEXT"
        if (q.questionCategory !== category) return false;
      }
    }

    // 3. Type Filter (Multi-select)
    if (types && types.length > 0) {
      if (!types.includes(q.type)) return false;
    }

    return true; // Keep question if it passed all checks
  });
};
