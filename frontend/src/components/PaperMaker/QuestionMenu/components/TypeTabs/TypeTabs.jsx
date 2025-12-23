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

  // Helper count
  const getSectionCount = (sectionId) => {
    return selectedQuestions.filter((q) => q.tabId === sectionId).length;
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
      (s) => s.questionType === activeTab
    );

    if (activeTab === "MCQ") return [];

    // --- SHORT QUESTIONS ---
    if (activeTab === "SHORT") {
      relevantSections.forEach((sec, index) => {
        const secId = `sec_${index}`;
        const total = parseInt(sec.totalQuestions || sec.quantity) || 0;
        const current = getSectionCount(secId);
        const qNum = index + 2; // Q.2, Q.3...

        subTabs.push({
          id: secId,
          label: `Q.${qNum}`,
          countLabel: `${current}/${total}`,
          isFull: current >= total && total > 0,
        });
      });
    }

    // --- LONG QUESTIONS (Numbering Fix) ---
    if (activeTab === "LONG") {
      const shortSectionsCount = sections.filter(
        (s) => s.questionType === "SHORT"
      ).length;
      let startQNum = shortSectionsCount + 2; // Start after Short Qs (e.g., Q.5)

      relevantSections.forEach((sec, index) => {
        const totalQs = parseInt(sec.totalQuestions || sec.quantity) || 0;

        // Loop through slots (Each slot is ONE Question Number, e.g. Q5)
        for (let i = 0; i < totalQs; i++) {
          // Current Number for this entire Block
          const currentQLabel = startQNum;

          if (sec.hasParts) {
            // Part A
            const idA = `long_${index}_${i}_a`;
            const currA = getSectionCount(idA);
            subTabs.push({
              id: idA,
              label: `Q.${currentQLabel} (a)`, // ✅ Q3 (a)
              countLabel: currA > 0 ? "1/1" : "0/1",
              isFull: currA > 0,
              isPart: true,
            });

            // Part B
            const idB = `long_${index}_${i}_b`;
            const currB = getSectionCount(idB);
            subTabs.push({
              id: idB,
              label: `Q.${currentQLabel} (b)`, // ✅ Q3 (b)
              countLabel: currB > 0 ? "1/1" : "0/1",
              isFull: currB > 0,
              isPart: true,
            });
          } else {
            // Full Question
            const idFull = `long_${index}_${i}_full`;
            const currFull = getSectionCount(idFull);
            subTabs.push({
              id: idFull,
              label: `Q.${currentQLabel}`, // ✅ Q3
              countLabel: currFull > 0 ? "1/1" : "0/1",
              isFull: currFull > 0,
              isPart: false,
            });
          }

          // Increment Question Number ONLY after creating slots for this question
          startQNum++;
        }
      });
    }

    return subTabs;
  };

  const subTabsList = getSubTabs();

  // ✅ FIX ISSUE 3: Auto-select first Sub-tab when Main Tab changes
  useEffect(() => {
    if (subTabsList.length > 0) {
      // Check if current activeSection is valid for this new list
      const isValid = subTabsList.some((tab) => tab.id === activeSection);

      // If no section selected OR selected section is not in current list -> Select First
      if (!activeSection || !isValid) {
        setActiveSection(subTabsList[0].id);
      }
    } else {
      setActiveSection(null);
    }
  }, [activeTab, paperData]); // Removed subTabsList dependency to avoid loops, rely on activeTab

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
