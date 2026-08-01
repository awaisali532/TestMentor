/**
 * ConstraintTracker — Enhanced O(1) Indexing & Live State Tracker
 *
 * Tracks:
 *  - Selected IDs (deduplication)
 *  - Chapter & Topic counts
 *  - Concept fingerprints (Similarity detection)
 *  - Difficulty ratios
 *  - Rejection counters for selection analytics
 */

const DIFF_MAP = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export const normalizeDifficulty = (d) =>
  DIFF_MAP[String(d || 'medium').toLowerCase()] || 'Medium';

export const getChapterId = (q) =>
  String(q.chapter?._id || q.chapter || '__no_chapter__');

export const getTopicId = (q) =>
  String(q.topics?.[0]?._id || q.topics?.[0] || '__no_topic__');

export class ConstraintTracker {
  constructor() {
    this.selectedIds      = new Set();
    this.usedFingerprints = new Set();
    this.chapterCounts    = new Map();
    this.topicCounts      = new Map();
    this.difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };

    this.totalSelected = 0;
    this.totalRejected = 0;
    this.lastChapterId = null;
    this.lastTopicId   = null;
  }

  /**
   * Concept fingerprint: combination of Chapter + Topic + Category + Difficulty.
   * Helps detect questions testing identical conceptual slots.
   */
  getQuestionFingerprint(q) {
    const ch   = getChapterId(q);
    const tp   = getTopicId(q);
    const cat  = Array.isArray(q.category || q.questionCategory)
      ? (q.category || q.questionCategory).join(',')
      : String(q.category || q.questionCategory || 'GENERIC');
    const diff = normalizeDifficulty(q.difficulty);

    return `${ch}::${tp}::${cat}::${diff}`;
  }

  hasFingerprint(fp) {
    return this.usedFingerprints.has(fp);
  }

  record(q) {
    const id = String(q._id);
    if (this.selectedIds.has(id)) return;

    const ch   = getChapterId(q);
    const tp   = getTopicId(q);
    const diff = normalizeDifficulty(q.difficulty);
    const fp   = this.getQuestionFingerprint(q);

    this.selectedIds.add(id);
    this.usedFingerprints.add(fp);

    this.chapterCounts.set(ch, (this.chapterCounts.get(ch) || 0) + 1);
    this.topicCounts.set(tp,   (this.topicCounts.get(tp)   || 0) + 1);
    this.difficultyCounts[diff]++;
    this.totalSelected++;

    this.lastChapterId = ch;
    this.lastTopicId   = tp;
  }

  recordRejection() {
    this.totalRejected++;
  }

  isSelected(id) {
    return this.selectedIds.has(String(id));
  }

  getChapterCount(q) {
    return this.chapterCounts.get(getChapterId(q)) || 0;
  }

  getTopicCount(q) {
    return this.topicCounts.get(getTopicId(q)) || 0;
  }

  getDiffRatio(diff) {
    if (this.totalSelected === 0) return 0;
    return (this.difficultyCounts[normalizeDifficulty(diff)] || 0) / this.totalSelected;
  }

  reset() {
    this.selectedIds.clear();
    this.usedFingerprints.clear();
    this.chapterCounts.clear();
    this.topicCounts.clear();
    this.difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };

    this.totalSelected = 0;
    this.totalRejected = 0;
    this.lastChapterId = null;
    this.lastTopicId   = null;
  }

  snapshot() {
    return {
      totalSelected: this.totalSelected,
      totalRejected: this.totalRejected,
      chapterCounts: Object.fromEntries(this.chapterCounts),
      topicCounts:   Object.fromEntries(this.topicCounts),
      difficultyCounts: { ...this.difficultyCounts },
    };
  }
}
