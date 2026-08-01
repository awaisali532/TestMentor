/**
 * QuestionScorer — Modular Plugin Pipeline & Fast Candidate Ranking
 */

import {
  SlotConstraintRule,
  ChapterBalanceRule,
  TopicDiversityRule,
  SimilarityRule,
  DifficultyBalanceRule,
} from './ScoringRules.js';

export class QuestionScorer {
  /**
   * @param {ConstraintTracker} tracker
   * @param {SeedRandom}        rng
   * @param {Object}            [options]
   * @param {Object}            [options.chapterWeights] - Optional chapter weightage map
   * @param {ScoringRule[]}     [options.customRules]    - Custom scoring rules plugin array
   */
  constructor(tracker, rng, options = {}) {
    this.tracker        = tracker;
    this.rng            = rng;
    this.chapterWeights = options.chapterWeights || {};

    // Standard scoring pipeline rules (Plugin architecture)
    this.rules = options.customRules || [
      new SlotConstraintRule(1000),
      new ChapterBalanceRule(35),
      new TopicDiversityRule(30),
      new SimilarityRule(40),
      new DifficultyBalanceRule(25),
    ];
  }

  /**
   * Evaluate a candidate question through the rule pipeline.
   */
  score(q, slotConfig = {}) {
    const context = {
      tracker:        this.tracker,
      slotConfig,
      chapterWeights: this.chapterWeights,
    };

    let totalScore = 100; // Base score

    for (const rule of this.rules) {
      totalScore += rule.evaluate(q, context);
    }

    // Seeded jitter for tie-breaking and variety
    totalScore += this.rng.next() * 5;

    return totalScore;
  }

  /**
   * Select best candidate for a slot.
   */
  selectBest(pool, slotConfig = {}) {
    let bestScore = -Infinity;
    let bestQ     = null;

    for (const q of pool) {
      if (this.tracker.isSelected(q._id)) continue;

      const s = this.score(q, slotConfig);
      if (s > bestScore) {
        bestScore = s;
        bestQ     = q;
      }
    }

    if (!bestQ && pool.length > 0) {
      this.tracker.recordRejection();
    }

    return bestQ;
  }

  /**
   * Select multiple candidates for a section slot.
   */
  selectMany(pool, count, slotConfig = {}) {
    const selected   = [];
    let candidates = pool.filter((q) => !this.tracker.isSelected(q._id));

    for (let i = 0; i < count && candidates.length > 0; i++) {
      const best = this.selectBest(candidates, {
        ...slotConfig,
        totalNeeded: count,
      });

      if (!best) break;

      this.tracker.record(best);
      selected.push(best);

      candidates = candidates.filter((q) => q._id !== best._id);
    }

    return selected;
  }
}
