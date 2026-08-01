/**
 * testEngine.js — Verification Script for Paper Generation Engine
 */

import { generatePaper } from '../frontend/src/utils/paperEngine/paperEngine.js';

// Mock dataset
const mockMCQ = Array.from({ length: 50 }, (_, i) => ({
  _id: `mcq_${i}`,
  statement: `Sample MCQ Question ${i}`,
  type: 'MCQ',
  difficulty: i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD',
  chapter: `chap_${i % 5}`,
  topics: [`topic_${i % 10}`],
  category: i % 2 === 0 ? 'CONCEPTUAL' : 'NUMERICAL',
}));

const mockSHORT = Array.from({ length: 40 }, (_, i) => ({
  _id: `short_${i}`,
  statement: `Sample Short Question ${i}`,
  type: 'SHORT',
  difficulty: i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD',
  chapter: `chap_${i % 5}`,
  topics: [`topic_${i % 8}`],
  category: 'SHORT_ANSWER',
}));

const mockLONG = Array.from({ length: 20 }, (_, i) => ({
  _id: `long_${i}`,
  statement: `Sample Long Question ${i}`,
  type: 'LONG',
  difficulty: i % 2 === 0 ? 'HARD' : 'MEDIUM',
  chapter: `chap_${i % 5}`,
  topics: [`topic_${i % 5}`],
  category: 'LONG_ANSWER',
}));

const mockPattern = {
  name: '9th Physics Test Pattern',
  sections: [
    { questionType: 'MCQ', totalQuestions: 12 },
    { questionType: 'SHORT', totalQuestions: 15 },
    {
      questionType: 'LONG',
      totalQuestions: 3,
      hasParts: true,
      subQuestions: [
        { questionCategory: 'LONG_ANSWER' },
        { questionCategory: 'LONG_ANSWER' },
      ],
    },
  ],
};

console.log('=== TESTING PAPER ENGINE WITH SEEDED SEED (12345) ===');

const result1 = generatePaper({
  sections: mockPattern.sections,
  masterPools: { MCQ: mockMCQ, SHORT: mockSHORT, LONG: mockLONG },
  subjectName: 'Physics',
  difficulties: ['EASY', 'MEDIUM', 'HARD'],
  seed: 12345,
});

console.log('Generated Questions Total:', result1.questions.length);
console.log('Counts:', result1.counts);
console.log('Quality Score:', result1.quality.score, '| Passed:', result1.quality.passed);
console.log('SubScores:', result1.quality.subScores);
console.log('Metrics:', result1.metrics);
console.log('Analytics:', result1.analytics);

// Test Determinism (Same Seed -> Same Questions)
const result2 = generatePaper({
  sections: mockPattern.sections,
  masterPools: { MCQ: mockMCQ, SHORT: mockSHORT, LONG: mockLONG },
  subjectName: 'Physics',
  difficulties: ['EASY', 'MEDIUM', 'HARD'],
  seed: 12345,
});

const isIdentical =
  JSON.stringify(result1.questions.map((q) => q._id)) ===
  JSON.stringify(result2.questions.map((q) => q._id));

console.log('Deterministic Test (Same seed produces identical paper):', isIdentical ? 'PASSED ✅' : 'FAILED ❌');
