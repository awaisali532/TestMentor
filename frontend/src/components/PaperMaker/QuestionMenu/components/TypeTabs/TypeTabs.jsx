import React, { useEffect } from "react";
import "./TypeTabs.css";

const TypeTabs = ({
  activeTab,
  setActiveTab,
  typeCounts,
  paperData,
  activeSection,
  setActiveSection,
  selectedQuestions = [],
}) => {
  const mainTabs = [
    { id: "MCQ", label: "Multiple Choice" },
    { id: "SHORT", label: "Short Questions" },
    { id: "LONG", label: "Long Questions" },
  ];

  // ✅ ROBUST COUNTING HELPER
  const getSectionCount = (sectionId) => {
    // Standard Match
    let count = selectedQuestions.filter((q) => q.tabId === sectionId).length;

    // If 0, try "Loose" Match (e.g. if tabId is just "0" instead of "sec_0")
    if (count === 0 && sectionId.startsWith("sec_")) {
      const justIndex = sectionId.replace("sec_", "");
      count = selectedQuestions.filter(
        (q) => String(q.tabId) === justIndex,
      ).length;
    }

    return count;
  };

  const getSubTabs = () => {
    let sections = [];
    if (paperData?.selectedPattern?.sections) {
      sections = paperData.selectedPattern.sections;
    } else if (paperData?.paperPattern?.sections) {
      sections = paperData.paperPattern.sections;
    }

    if (!sections || sections.length === 0) return [];

    const subTabs = [];
    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab,
    );

    if (activeTab === "MCQ") return [];

    // --- SHORT QUESTIONS ---
    if (activeTab === "SHORT") {
      relevantSections.forEach((sec, index) => {
        // 🔥 CRITICAL: Match logic with PaperMaker
        // We need to find the REAL index of this section in the full list
        const realIndex = sections.indexOf(sec);

        const secId = `sec_${realIndex}`; // Use Real Index, not filtered index
        const total = parseInt(sec.totalQuestions || sec.quantity) || 0;
        const current = getSectionCount(secId);

        // Label logic (Q.2, Q.3, etc) depends on filtered index
        // Typically Q.2 starts after MCQ. Assuming MCQ is Q.1 (or implicit)
        // Usually: MCQ=Q1, Short1=Q2...
        // Let's rely on the visual index for Label, but Real Index for ID
        const qNum = index + 2;

        subTabs.push({
          id: secId,
          label: `Q.${qNum}`,
          countLabel: `${current}/${total}`,
          isFull: current >= total && total > 0,
        });
      });
    }

    // --- LONG QUESTIONS ---
    if (activeTab === "LONG") {
      const shortSectionsCount = sections.filter(
        (s) => s.questionType === "SHORT",
      ).length;
      let startQNum = shortSectionsCount + 2;

      relevantSections.forEach((sec, index) => {
        const realIndex = sections.indexOf(sec);
        const totalQs = parseInt(sec.totalQuestions || sec.quantity) || 0;

        for (let i = 0; i < totalQs; i++) {
          const currentQLabel = startQNum;

          if (sec.hasParts) {
            const idA = `long_${realIndex}_${i}_a`;
            const currA = getSectionCount(idA);
            subTabs.push({
              id: idA,
              label: `Q.${currentQLabel} (a)`,
              countLabel: currA > 0 ? "1/1" : "0/1",
              isFull: currA > 0,
              isPart: true,
            });

            const idB = `long_${realIndex}_${i}_b`;
            const currB = getSectionCount(idB);
            subTabs.push({
              id: idB,
              label: `Q.${currentQLabel} (b)`,
              countLabel: currB > 0 ? "1/1" : "0/1",
              isFull: currB > 0,
              isPart: true,
            });
          } else {
            const idFull = `long_${realIndex}_${i}_full`;
            const currFull = getSectionCount(idFull);
            subTabs.push({
              id: idFull,
              label: `Q.${currentQLabel}`,
              countLabel: currFull > 0 ? "1/1" : "0/1",
              isFull: currFull > 0,
              isPart: false,
            });
          }
          startQNum++;
        }
      });
    }

    return subTabs;
  };

  const subTabsList = getSubTabs();

  // Auto-select logic
  useEffect(() => {
    if (subTabsList.length > 0) {
      const isValid = subTabsList.some((tab) => tab.id === activeSection);
      if (!activeSection || !isValid) {
        setActiveSection(subTabsList[0].id);
      }
    } else {
      setActiveSection(null);
    }
  }, [activeTab, paperData]);

  return (
    <div className="qm-tabs-container">
      <div className="qm-main-tabs">
        {mainTabs.map((tab) => {
          const countData = typeCounts?.[tab.id] || { current: 0, total: 0 };
          const isFull =
            countData.current >= countData.total && countData.total > 0;

          return (
            <button
              key={tab.id}
              className={`qm-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className={`qm-tab-badge ${isFull ? "full" : ""}`}>
                {countData.current}/{countData.total}
              </span>
            </button>
          );
        })}
      </div>

      {subTabsList.length > 0 && (
        <div className="qm-sub-tabs">
          {subTabsList.map((sub) => (
            <button
              key={sub.id}
              className={`qm-sub-btn ${
                activeSection === sub.id ? "active" : ""
              } ${sub.isFull ? "full" : ""}`}
              onClick={() => setActiveSection(sub.id)}
            >
              {sub.label}
              <span className="sub-count">({sub.countLabel})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TypeTabs;
