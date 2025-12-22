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

  // Helper to count questions
  const getSectionCount = (sectionId) => {
    return selectedQuestions.filter((q) => q.tabId === sectionId).length;
  };

  const getSubTabs = () => {
    const sections = paperData?.selectedPattern?.sections || [];
    const subTabs = [];

    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab
    );

    if (activeTab === "MCQ") return [];

    // --- SHORT QUESTIONS LOGIC (UPDATED) ---
    if (activeTab === "SHORT") {
      relevantSections.forEach((sec, index) => {
        const secId = `sec_${index}`;
        const total = parseInt(sec.totalQuestions) || 0;
        const current = getSectionCount(secId);

        // ✅ AUTO NUMBERING LOGIC:
        // MCQ Q.1 hota hai, to Short Q.2 se start hoga.
        // Index 0 = Q.2, Index 1 = Q.3, etc.
        const qNum = index + 2;

        subTabs.push({
          id: secId,
          label: `Q.${qNum}`, // ✅ Ab Title ignore hoga, Auto Q.Number ayega
          originalSection: sec,
          countLabel: `${current}/${total}`,
          isFull: current >= total && total > 0,
        });
      });
    }

    // --- LONG QUESTIONS LOGIC ---
    if (activeTab === "LONG") {
      // 1. Calculate Start Number
      // Total Short Sections count karo taake Long ka number uske baad aye
      const shortSectionsCount = sections.filter(
        (s) => s.questionType === "SHORT"
      ).length;

      // MCQ (1) + Short Sections count + 1 = Long Start Number
      let startQNum = shortSectionsCount + 2;

      relevantSections.forEach((sec, index) => {
        const totalQs = parseInt(sec.totalQuestions) || 0;

        for (let i = 0; i < totalQs; i++) {
          const currentQNum = startQNum + i;

          if (sec.hasParts) {
            // Part A
            const idA = `long_${index}_${i}_a`;
            const currA = getSectionCount(idA);
            subTabs.push({
              id: idA,
              label: `Q.${currentQNum} (Part A)`,
              countLabel: currA > 0 ? "1/1" : "0/1",
              isFull: currA > 0,
              isPart: true,
            });

            // Part B
            const idB = `long_${index}_${i}_b`;
            const currB = getSectionCount(idB);
            subTabs.push({
              id: idB,
              label: `Q.${currentQNum} (Part B)`,
              countLabel: currB > 0 ? "1/1" : "0/1",
              isFull: currB > 0,
              isPart: true,
            });
          } else {
            // Direct Question
            const idFull = `long_${index}_${i}_full`;
            const currFull = getSectionCount(idFull);
            subTabs.push({
              id: idFull,
              label: `Q.${currentQNum}`,
              countLabel: currFull > 0 ? "1/1" : "0/1",
              isFull: currFull > 0,
              isPart: false,
            });
          }
        }
        // Aglay loop ke liye number barha do
        startQNum += totalQs;
      });
    }

    return subTabs;
  };

  const subTabsList = getSubTabs();

  // Auto-select first sub-tab
  useEffect(() => {
    if (subTabsList.length > 0 && !activeSection) {
      setActiveSection(subTabsList[0].id);
    }
  }, [activeTab, subTabsList]);

  return (
    <div className="qm-tabs-container">
      {/* 1. MAIN TABS */}
      <div className="qm-main-tabs">
        {mainTabs.map((tab) => {
          const countData = typeCounts
            ? typeCounts[tab.id]
            : { current: 0, total: 0 };
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

      {/* 2. SUB TABS */}
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
