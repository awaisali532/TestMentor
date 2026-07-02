// 1. Auto-Heal Logic (Fixes tabIds without double-rendering)
export const healPaperQuestions = (paperData) => {
  if (!paperData?.selectedPattern?.sections || !paperData?.questions)
    return paperData;

  const sections = paperData.selectedPattern.sections;
  const shortIndices = sections
    .map((s, i) => (s.questionType === "SHORT" ? i : -1))
    .filter((i) => i !== -1);
  const longIndices = sections
    .map((s, i) => (s.questionType === "LONG" ? i : -1))
    .filter((i) => i !== -1);

  let hasChanges = false;
  const healedQuestions = paperData.questions.map((q) => {
    if (q.type === "MCQ") return q;

    let currentIdx = -1;
    let needsFix = false;

    if (q.tabId && q.tabId.startsWith("sec_"))
      currentIdx = parseInt(q.tabId.replace("sec_", ""));
    else if (q.tabId && q.tabId.startsWith("long_"))
      currentIdx = parseInt(q.tabId.split("_")[1]);
    else needsFix = true;

    if (q.type === "SHORT" && !shortIndices.includes(currentIdx))
      needsFix = true;
    if (q.type === "LONG" && !longIndices.includes(currentIdx)) needsFix = true;

    if (needsFix) {
      hasChanges = true;
      if (q.type === "SHORT" && shortIndices.length > 0)
        return { ...q, tabId: `sec_${shortIndices[0]}` };
      if (q.type === "LONG" && longIndices.length > 0)
        return { ...q, tabId: `long_${longIndices[0]}_full` };
    }
    return q;
  });

  return hasChanges ? { ...paperData, questions: healedQuestions } : paperData;
};

// 2. Pattern Matching & Sync Logic (120+ Lines extracted from PaperMaker)
export const syncPatternUpdate = (prevData, updatedPattern) => {
  const oldSections = prevData.selectedPattern?.sections || [];
  const newSections = updatedPattern.sections || [];

  const indexMap = {};
  const usedNewIndices = new Set();

  const toNum = (val) => (val ? parseInt(val) : 0);
  const getMarks = (sec) => toNum(sec.marks || sec.marksPerQuestion);
  const getQty = (sec) => toNum(sec.quantity || sec.totalQuestions);

  // MATCHING STRATEGY
  oldSections.forEach((oldSec, oldIdx) => {
    let matchIdx = newSections.findIndex((newSec, newIdx) => {
      if (usedNewIndices.has(newIdx)) return false;
      return (
        newSec.questionType === oldSec.questionType &&
        getMarks(newSec) === getMarks(oldSec) &&
        getQty(newSec) === getQty(oldSec)
      );
    });

    if (matchIdx === -1) {
      matchIdx = newSections.findIndex((newSec, newIdx) => {
        if (usedNewIndices.has(newIdx)) return false;
        return (
          newSec.questionType === oldSec.questionType &&
          getQty(newSec) === getQty(oldSec)
        );
      });
    }

    if (matchIdx === -1) {
      matchIdx = newSections.findIndex((newSec, newIdx) => {
        if (usedNewIndices.has(newIdx)) return false;
        return (
          newSec.questionType === oldSec.questionType &&
          getMarks(newSec) === getMarks(oldSec)
        );
      });
    }

    if (matchIdx === -1) {
      matchIdx = newSections.findIndex(
        (newSec, newIdx) =>
          !usedNewIndices.has(newIdx) &&
          newSec.questionType === oldSec.questionType,
      );
    }

    if (matchIdx !== -1) {
      const newSec = newSections[matchIdx];
      const isPartsChanged =
        oldSec.questionType === "LONG" &&
        !!oldSec.hasParts !== !!newSec.hasParts;
      if (isPartsChanged) usedNewIndices.add(matchIdx);
      else {
        indexMap[oldIdx] = matchIdx;
        usedNewIndices.add(matchIdx);
      }
    }
  });

  const updatedQuestions = prevData.questions
    .map((q) => {
      if (q.type === "MCQ") return q;
      if (!q.tabId) return q;

      let oldIdx = -1;
      if (q.tabId.startsWith("sec_"))
        oldIdx = parseInt(q.tabId.replace("sec_", ""));
      else if (q.tabId.startsWith("long_")) {
        const parts = q.tabId.split("_");
        if (parts.length >= 2) oldIdx = parseInt(parts[1]);
      }

      if (oldIdx !== -1 && indexMap[oldIdx] !== undefined) {
        const newIdx = indexMap[oldIdx];
        const oldSec = oldSections[oldIdx];
        const newSec = newSections[newIdx];

        if (q.type === "LONG" && newSec.hasParts) {
          const suffix = q.tabId.split("_")[3];
          if (suffix === "a" || suffix === "b") {
            const subIndex = suffix === "a" ? 0 : 1;
            const oldSubCat = oldSec.subQuestions?.[subIndex]?.questionCategory;
            const newSubCat = newSec.subQuestions?.[subIndex]?.questionCategory;
            if (oldSubCat && newSubCat && oldSubCat !== newSubCat) return null;
          }
        } else {
          const oldCat = oldSec.questionCategory;
          const newCat = newSec.questionCategory;
          if (oldCat && newCat && oldCat !== newCat) return null;
        }

        if (newIdx !== oldIdx) {
          if (q.type === "SHORT") return { ...q, tabId: `sec_${newIdx}` };
          if (q.type === "LONG") {
            const parts = q.tabId.split("_");
            if (parts.length >= 2) {
              parts[1] = newIdx;
              return { ...q, tabId: parts.join("_") };
            }
          }
        }
        return q;
      }
      return null;
    })
    .filter(Boolean);

  const newTotalMarks =
    updatedPattern.totalMarks ||
    newSections.reduce((sum, sec) => sum + getMarks(sec) * getQty(sec), 0);

  return {
    ...prevData,
    selectedPattern: updatedPattern,
    questions: updatedQuestions,
    totalMarks: newTotalMarks,
  };
};
