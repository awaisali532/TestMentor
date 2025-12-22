import React, { useEffect } from "react";
import "./TypeTabs.css";

const TypeTabs = ({
  activeTab,
  setActiveTab,
  typeCounts,
  paperData,
  activeSection,
  setActiveSection,
  selectedQuestions = [], // This receives 'tempSelected' from Parent
}) => {
  const mainTabs = [
    { id: "MCQ", label: "Multiple Choice" },
    { id: "SHORT", label: "Short Questions" },
    { id: "LONG", label: "Long Questions" },
  ];

  // ✅ Helper to count questions inside specific sections (Live Updates)
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

        // ✅ Live Count for this specific Q.2 / Q.3 etc.
        const current = getSectionCount(secId);
        const qNum = index + 2;

        subTabs.push({
          id: secId,
          label: `Q.${qNum}`,
          originalSection: sec,
          countLabel: `${current}/${total}`,
          isFull: current >= total && total > 0,
        });
      });
    }

    // --- LONG QUESTIONS ---
    if (activeTab === "LONG") {
      const shortSectionsCount = sections.filter(
        (s) => s.questionType === "SHORT"
      ).length;
      let startQNum = shortSectionsCount + 2;

      relevantSections.forEach((sec, index) => {
        const totalQs = parseInt(sec.totalQuestions || sec.quantity) || 0;

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
            // Full Question
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
  }, [activeTab, subTabsList, activeSection]);

  return (
    <div className="qm-tabs-container">
      <div className="qm-main-tabs">
        {mainTabs.map((tab) => {
          const countData =
            typeCounts && typeCounts[tab.id]
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
