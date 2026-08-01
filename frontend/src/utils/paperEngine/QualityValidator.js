/**
 * QualityValidator — Detailed Diagnostic Quality Assessment Engine
 *
 * Computes individual sub-scores (0–100):
 *   1. Uniqueness         (100 = 0 dupes)
 *   2. Chapter Balance    (100 = even spread across chapters)
 *   3. Topic Diversity    (100 = no topic overrepresented)
 *   4. Difficulty Mix     (100 = balanced mix according to whitelist)
 *
 * Composite Score = Weighted average of sub-scores.
 */

import {
  getChapterId,
  getTopicId,
  normalizeDifficulty,
} from './ConstraintTracker.js';

export const QUALITY_THRESHOLD = 70;

export class QualityValidator {
  validate(questions, config = {}) {
    if (!questions || questions.length === 0) {
      return {
        score: 0,
        subScores: { uniqueness: 0, chapterBalance: 0, topicDiversity: 0, difficultyMix: 0 },
        issues: ['No questions were generated.'],
        passed: false,
      };
    }

    const issues = [];

    // ── 1. Uniqueness Sub-Score ──────────────────────────────────────────────
    const ids       = questions.map((q) => String(q._id));
    const uniqueIds = new Set(ids);
    const dupeCount = ids.length - uniqueIds.size;
    const uniquenessScore = Math.max(0, 100 - dupeCount * 25);

    if (dupeCount > 0) {
      issues.push(`Duplicate Prevention: ${dupeCount} duplicate question(s) detected.`);
    }

    // ── 2. Chapter Balance Sub-Score ─────────────────────────────────────────
    const chapterCounts = {};
    questions.forEach((q) => {
      const ch = getChapterId(q);
      chapterCounts[ch] = (chapterCounts[ch] || 0) + 1;
    });

    const chValues = Object.values(chapterCounts);
    let chapterScore = 100;
    if (chValues.length > 1) {
      const maxCh = Math.max(...chValues);
      const minCh = Math.min(...chValues);
      const gap   = maxCh - minCh;
      if (gap > 2) {
        chapterScore = Math.max(40, 100 - gap * 15);
        issues.push(`Chapter Balance Imbalance: Chapter question gap is ${gap}.`);
      }
    }

    // ── 3. Topic Diversity Sub-Score ────────────────────────────────────────
    const topicCounts = {};
    questions.forEach((q) => {
      const tp = getTopicId(q);
      topicCounts[tp] = (topicCounts[tp] || 0) + 1;
    });

    const tpValues = Object.values(topicCounts);
    let topicScore = 100;
    if (tpValues.length > 1) {
      const maxTp = Math.max(...tpValues);
      const avg   = questions.length / tpValues.length;
      if (maxTp > avg + 2) {
        topicScore = 70;
        issues.push(`Topic Repetition: Some topics are over-represented (${maxTp} questions).`);
      }
    }

    // ── 4. Difficulty Mix Sub-Score ─────────────────────────────────────────
    const allowedDiffs = (config.allowedDiffs || ['Easy', 'Medium', 'Hard']).map(normalizeDifficulty);
    let diffScore = 100;

    if (allowedDiffs.length > 1 && questions.length >= 3) {
      const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
      questions.forEach((q) => {
        diffCounts[normalizeDifficulty(q.difficulty)]++;
      });

      Object.entries(diffCounts).forEach(([diff, count]) => {
        const ratio = count / questions.length;
        if (ratio > 0.70) {
          diffScore -= 20;
          issues.push(`Difficulty Imbalance: "${diff}" dominates ${Math.round(ratio * 100)}% of the paper.`);
        }
      });
      diffScore = Math.max(0, diffScore);
    }

    // ── Composite Score Calculation ──────────────────────────────────────────
    const compositeScore = Math.round(
      uniquenessScore * 0.40 +
      chapterScore    * 0.25 +
      topicScore      * 0.20 +
      diffScore       * 0.15
    );

    return {
      score: compositeScore,
      subScores: {
        uniqueness:     uniquenessScore,
        chapterBalance: chapterScore,
        topicDiversity: topicScore,
        difficultyMix:  diffScore,
      },
      issues,
      passed: compositeScore >= QUALITY_THRESHOLD && dupeCount === 0,
    };
  }
}
