import React, { useEffect } from "react";

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

  const getSectionCount = (sectionId) => {
    let count = selectedQuestions.filter((q) => q.tabId === sectionId).length;
    if (count === 0 && sectionId.startsWith("sec_")) {
      const justIndex = sectionId.replace("sec_", "");
      count = selectedQuestions.filter(
        (q) => String(q.tabId) === justIndex,
      ).length;
    }
    return count;
  };

  const getSubTabs = () => {
    let sections =
      paperData?.selectedPattern?.sections ||
      paperData?.paperPattern?.sections ||
      [];
    if (!sections || sections.length === 0) return [];

    const subTabs = [];
    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab,
    );

    if (activeTab === "MCQ") return [];

    if (activeTab === "SHORT") {
      relevantSections.forEach((sec, index) => {
        const realIndex = sections.indexOf(sec);
        const secId = `sec_${realIndex}`;
        const total = parseInt(sec.totalQuestions || sec.quantity) || 0;
        const current = getSectionCount(secId);
        const qNum = index + 2;

        subTabs.push({
          id: secId,
          label: `Q.${qNum}`,
          countLabel: `${current}/${total}`,
          isFull: current >= total && total > 0,
        });
      });
    }

    if (activeTab === "LONG") {
      const shortSectionsCount = sections.filter(
        (s) => s.questionType === "SHORT",
      ).length;
      let startQNum = shortSectionsCount + 2;

      relevantSections.forEach((sec) => {
        const realIndex = sections.indexOf(sec);
        const totalQs = parseInt(sec.totalQuestions || sec.quantity) || 0;

        for (let i = 0; i < totalQs; i++) {
          const currentQLabel = startQNum;
          if (sec.hasParts) {
            const idA = `long_${realIndex}_${i}_a`;
            const idB = `long_${realIndex}_${i}_b`;
            subTabs.push({
              id: idA,
              label: `Q.${currentQLabel} (a)`,
              countLabel: getSectionCount(idA) > 0 ? "1/1" : "0/1",
              isFull: getSectionCount(idA) > 0,
              isPart: true,
            });
            subTabs.push({
              id: idB,
              label: `Q.${currentQLabel} (b)`,
              countLabel: getSectionCount(idB) > 0 ? "1/1" : "0/1",
              isFull: getSectionCount(idB) > 0,
              isPart: true,
            });
          } else {
            const idFull = `long_${realIndex}_${i}_full`;
            subTabs.push({
              id: idFull,
              label: `Q.${currentQLabel}`,
              countLabel: getSectionCount(idFull) > 0 ? "1/1" : "0/1",
              isFull: getSectionCount(idFull) > 0,
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

  useEffect(() => {
    if (subTabsList.length > 0) {
      const isValid = subTabsList.some((tab) => tab.id === activeSection);
      if (!activeSection || !isValid) setActiveSection(subTabsList[0].id);
    } else {
      setActiveSection(null);
    }
  }, [activeTab, paperData]);

  return (
    <div className="flex flex-col gap-2.5 border-b border-border pb-4 mb-2.5">
      <div className="flex gap-2.5">
        {mainTabs.map((tab) => {
          const countData = typeCounts?.[tab.id] || { current: 0, total: 0 };
          const isFull =
            countData.current >= countData.total && countData.total > 0;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-2.5 border rounded-lg font-semibold text-sm cursor-pointer transition-all flex justify-center items-center gap-2 ${
                isActive
                  ? "bg-accent-1/10 text-accent-1 border-accent-1"
                  : "border-border bg-bg-body text-muted hover:bg-pill-bg hover:text-main"
              }`}
            >
              {tab.label}
              <span
                className={`text-[0.75px] px-1.5 py-0.5 rounded border ${isFull ? "bg-emerald-500/15 text-emerald-500 border-emerald-500" : "bg-card border-border"}`}
              >
                {countData.current}/{countData.total}
              </span>
            </button>
          );
        })}
      </div>

      {subTabsList.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto py-1 px-0.5 custom-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {subTabsList.map((sub) => {
            const isActive = activeSection === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSection(sub.id)}
                className={`px-3.5 py-1.5 rounded-full border text-[0.85rem] font-medium cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-accent-1 text-white border-accent-1 shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
                    : sub.isFull
                      ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-border bg-card text-muted hover:bg-pill-bg hover:text-main"
                }`}
              >
                {sub.label}
                <span
                  className={`text-[0.75rem] font-bold ${isActive ? "text-white/90" : "opacity-70"}`}
                >
                  ({sub.countLabel})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(TypeTabs);
