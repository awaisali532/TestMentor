/**
 * Shuffles an array randomly (Fisher-Yates Algorithm)
 */
const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

/**
 * INTELLIGENT SELECTION ALGORITHM
 * 1. Filters Context (Avoids same chapter as Part A)
 * 2. Balances Difficulty (If Part A is Hard, try Easy/Medium)
 * 3. Distributes Quota (Equal questions from all available chapters)
 */
export const generateAutoSelection = (
  pool, // Array of available filtered questions
  countNeeded, // Number of questions to pick
  excludeIds = [], // IDs to ignore (already selected)
  options = {}, // { avoidChapters: [], targetDifficulty: "Medium" }
) => {
  // 1. Remove already selected questions
  let candidates = pool.filter((q) => !excludeIds.includes(q._id));

  // 2. CONTEXT CONSTRAINT: Avoid Specific Chapters (e.g. for Long Q Part B)
  if (options.avoidChapters && options.avoidChapters.length > 0) {
    const filteredByChap = candidates.filter((q) => {
      const qChap = q.chapter?._id || q.chapter;
      return !options.avoidChapters.includes(qChap);
    });
    // Fallback: Agar filter karne k baad sawal kam par jayen, to original use kro
    if (filteredByChap.length >= countNeeded) {
      candidates = filteredByChap;
    }
  }

  // 3. DIFFICULTY BALANCING
  if (options.targetDifficulty) {
    const diffOrder = {
      Easy: ["Easy", "Medium", "Hard"],
      Medium: ["Medium", "Easy", "Hard"],
      Hard: ["Hard", "Medium", "Easy"],
    };
    const priority = diffOrder[options.targetDifficulty] || [
      "Medium",
      "Easy",
      "Hard",
    ];

    // Sort based on priority (Soft Sort)
    candidates.sort((a, b) => {
      const indexA = priority.indexOf(a.difficulty);
      const indexB = priority.indexOf(b.difficulty);
      return indexA - indexB;
    });
  } else {
    // Randomize if no difficulty preference
    candidates = shuffle(candidates);
  }

  // 4. QUOTA SYSTEM (Equal Distribution across Chapters)
  const groupedByChap = {};
  candidates.forEach((q) => {
    const chId = q.chapter?._id || q.chapter || "unknown";
    if (!groupedByChap[chId]) groupedByChap[chId] = [];
    groupedByChap[chId].push(q);
  });

  const availableChapters = Object.keys(groupedByChap);
  const selected = [];

  if (availableChapters.length === 0) return [];

  // Round Robin Selection Logic
  let chapIndex = 0;
  // Deep copy to modify safely
  let roundRobinCandidates = [...candidates];

  while (selected.length < countNeeded && roundRobinCandidates.length > 0) {
    const currentChap = availableChapters[chapIndex % availableChapters.length];
    const questionsInChap = groupedByChap[currentChap];

    if (questionsInChap && questionsInChap.length > 0) {
      const pick = questionsInChap.shift(); // Pick first (sorted/shuffled)
      selected.push(pick);

      // Remove from pool
      roundRobinCandidates = roundRobinCandidates.filter(
        (c) => c._id !== pick._id,
      );
    }

    chapIndex++;
    if (roundRobinCandidates.length === 0) break;
  }

  return selected;
};
