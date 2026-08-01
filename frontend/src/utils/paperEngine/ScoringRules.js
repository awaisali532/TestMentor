/**
 * ScoringRules — Decoupled, Plugin-Style Scoring Pipeline
 *
 * Each rule implements:
 *   evaluate(candidate, context) -> number (score delta)
 *
 * Easy to extend for future requirements (Bloom's Taxonomy, Cognitive Levels, etc.)
 */

import {
  getChapterId,
  getTopicId,
  normalizeDifficulty,
} from './ConstraintTracker.js';

// ── Base Scoring Rule Interface ─────────────────────────────────────────────

export class ScoringRule {
  constructor(name, weight) {
    this.name   = name;
    this.weight = weight;
  }

  evaluate(candidate, context) {
    return 0;
  }
}

// ── 1. Slot Constraint Rule ──────────────────────────────────────────────────

export class SlotConstraintRule extends ScoringRule {
  constructor(weight = 1000) {
    super('SlotConstraint', weight);
  }

  evaluate(candidate, context) {
    const { slotConfig = {} } = context;
    let score = 0;

    // Hard check: Difficulty whitelist
    if (
      slotConfig.allowedDiffs &&
      !slotConfig.allowedDiffs.includes(normalizeDifficulty(candidate.difficulty))
    ) {
      return -this.weight;
    }

    // Hard check: Avoid Chapters (e.g. Long Q Part B must differ from Part A)
    const chId = getChapterId(candidate);
    if (slotConfig.avoidChapters?.includes(chId)) {
      return -this.weight;
    }

    // Soft check: Preferred target difficulty match
    if (slotConfig.targetDiff) {
      const normTarget = normalizeDifficulty(slotConfig.targetDiff);
      score +=
        normalizeDifficulty(candidate.difficulty) === normTarget ? 25 : -10;
    }

    return score;
  }
}

// ── 2. Chapter Balance & Weightage Rule ──────────────────────────────────────

export class ChapterBalanceRule extends ScoringRule {
  constructor(weight = 35) {
    super('ChapterBalance', weight);
  }

  evaluate(candidate, context) {
    const { tracker, slotConfig = {}, chapterWeights = {} } = context;
    const chId     = getChapterId(candidate);
    const count    = tracker.getChapterCount(candidate);
    const totalSel = tracker.totalSelected || 1;

    // Weightage multiplier (if custom chapter marks weightage provided)
    const weightage = chapterWeights[chId] || 1.0;
    const expected  = (slotConfig.totalNeeded || 1) * weightage;

    const ratio = count / Math.max(expected, 0.5);
    let score = this.weight * Math.max(0, 1 - ratio);

    // Consecutive chapter repeat penalty
    if (tracker.lastChapterId && tracker.lastChapterId === chId) {
      score -= 18;
    }

    return score;
  }
}

// ── 3. Topic Diversity Rule ─────────────────────────────────────────────────

export class TopicDiversityRule extends ScoringRule {
  constructor(weight = 30) {
    super('TopicDiversity', weight);
  }

  evaluate(candidate, context) {
    const { tracker, slotConfig = {} } = context;
    const tpId  = getTopicId(candidate);
    const count = tracker.getTopicCount(candidate);

    if (slotConfig.avoidTopics?.includes(tpId)) {
      return -25;
    }

    const ratio = count / Math.max(slotConfig.totalNeeded || 1, 1);
    let score = this.weight * Math.max(0, 1 - ratio);

    if (tracker.lastTopicId && tracker.lastTopicId === tpId) {
      score -= 12;
    }

    return score;
  }
}

// ── 4. Concept Similarity Detection Rule ───────────────────────────────────

export class SimilarityRule extends ScoringRule {
  constructor(weight = 40) {
    super('Similarity', weight);
  }

  evaluate(candidate, context) {
    const { tracker } = context;
    const signature = tracker.getQuestionFingerprint(candidate);

    // Penalize if exact same topic + category + difficulty concept picked previously
    if (tracker.hasFingerprint(signature)) {
      return -this.weight;
    }

    return 0;
  }
}

// ── 5. Difficulty Balance Rule ───────────────────────────────────────────────

export class DifficultyBalanceRule extends ScoringRule {
  constructor(weight = 25) {
    super('DifficultyBalance', weight);
  }

  evaluate(candidate, context) {
    const { tracker, slotConfig = {} } = context;
    const diff = normalizeDifficulty(candidate.difficulty);

    if (slotConfig.targetDiff) return 0; // Handled by SlotConstraintRule

    const currentRatio = tracker.getDiffRatio(diff);
    const targetRatio  = 1 / (slotConfig.allowedDiffs?.length || 3);
    const deficit      = Math.max(0, targetRatio - currentRatio);

    return this.weight * (deficit / targetRatio);
  }
}
