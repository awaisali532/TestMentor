/**
 * LongPairingEngine — Intelligent Part A / Part B pairing for Long Questions.
 *
 * Rules:
 *   - Part A and Part B must NOT be the same question.
 *   - Part B must come from a DIFFERENT chapter than Part A (hard constraint).
 *   - Part B should come from a different topic (soft constraint).
 *   - Difficulty should be complementary:
 *       Part A Hard   → Part B Medium
 *       Part A Easy   → Part B Hard
 *       Part A Medium → Part B Hard
 */

import {
  getChapterId,
  getTopicId,
  normalizeDifficulty,
} from './ConstraintTracker.js';

export class LongPairingEngine {
  /**
   * Derive selection constraints for Part B given the chosen Part A.
   *
   * @param {Object|null} partAQuestion
   * @returns {{
   *   avoidChapters: string[],
   *   avoidTopics:   string[],
   *   targetDiff:    string|null
   * }}
   */
  getPartBConstraints(partAQuestion) {
    if (!partAQuestion) {
      return { avoidChapters: [], avoidTopics: [], targetDiff: null };
    }

    const chId = getChapterId(partAQuestion);
    const tpId = getTopicId(partAQuestion);
    const diff = normalizeDifficulty(partAQuestion.difficulty);

    // Complementary difficulty map
    const complementMap = { Hard: 'Medium', Easy: 'Hard', Medium: 'Hard' };

    return {
      avoidChapters: [chId],               // Hard — must differ from Part A
      avoidTopics:   [tpId],               // Soft — prefer different topic
      targetDiff:    complementMap[diff],   // Complementary difficulty
    };
  }

  /**
   * Validate that two questions form an acceptable long-question pair.
   * Returns false if they are the same question.
   */
  validatePair(partA, partB) {
    if (!partA || !partB) return false;
    return String(partA._id) !== String(partB._id);
  }
}
