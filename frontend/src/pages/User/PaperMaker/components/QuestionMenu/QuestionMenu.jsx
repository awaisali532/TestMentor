import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTrash, FaCheck, FaRobot } from "react-icons/fa";
import MenuHeader from "./components/MenuHeader";
import MenuFilters from "./components/MenuFilters";
import TypeTabs from "./components/TypeTabs";
import QuestionList from "./components/QuestionList";
import Loader from "../../../../../components/ui/Loader";
import { useTheme } from "../../../../../context/ThemeContext";
import { getCategoriesForSubject } from "../../../../../config/SubjectConfig";
import { generateAutoSelection } from "../../../../../utils/AutoPaperGenerator";
import RenderText from "../../../../../components/ui/RenderText";

const QuestionMenu = ({
  isOpen,
  onClose,
  paperData,
  isSidebarCollapsed,
  onEditPattern,
  selectedQuestions = [],
  onAddQuestionsToPaper,
}) => {
  const { theme } = useTheme();
  const [categoriesList, setCategoriesList] = useState([]);
  const [difficultiesList] = useState(["Easy", "Medium", "Hard"]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customToast, setCustomToast] = useState(null);

  const [activeTab, setActiveTab] = useState("MCQ");
  const [activeSection, setActiveSection] = useState(null);
  const [filters, setFilters] = useState({ category: [], difficulty: [] });
  const [tempSelected, setTempSelected] = useState([]);
  const [availablePool, setAvailablePool] = useState([]);

  useEffect(() => {
    if (paperData?.subject)
      setCategoriesList(
        getCategoriesForSubject(
          paperData.subject.subjectName || paperData.subject,
        ),
      );
  }, [paperData]);

  const getSafeID = useCallback(
    (q) =>
      !q
        ? ""
        : typeof q.questionId === "object"
          ? String(q.questionId._id)
          : String(q.questionId || q._id),
    [],
  );

  useEffect(() => {
    if (isOpen && paperData?.questions) setTempSelected(paperData.questions);
  }, [isOpen, paperData]);

  useEffect(() => {
    if (paperData?.selectedPattern && activeSection) setActiveSection(null);
  }, [paperData?.selectedPattern]);

  useEffect(() => {
    setActiveSection(null);
  }, [activeTab]);

  const targetChapters = useMemo(() => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    if (!pattern?.sections) return null;
    let targetSection = null;
    if (activeTab === "MCQ")
      targetSection = pattern.sections.find(
        (s) => String(s.questionType).toUpperCase() === "MCQ",
      );
    else if (activeSection) {
      const realIndex = parseInt(activeSection.split("_")[1]);
      if (!isNaN(realIndex) && pattern.sections[realIndex])
        targetSection = pattern.sections[realIndex];
    }
    return targetSection?.linkedChapters?.length > 0
      ? targetSection.linkedChapters
      : null;
  }, [activeTab, activeSection, paperData]);

  const targetCategory = useMemo(() => {
    if (!activeSection) return null;
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    if (!pattern?.sections) return null;
    let targetSection = null;
    if (activeSection.startsWith("sec_")) {
      const realIndex = parseInt(activeSection.split("_")[1]);
      if (!isNaN(realIndex) && pattern.sections[realIndex])
        targetSection = pattern.sections[realIndex];
    } else if (activeSection.startsWith("long_")) {
      const parts = activeSection.split("_");
      const secIndex = parseInt(parts[1]);
      if (!isNaN(secIndex) && pattern.sections[secIndex]) {
        targetSection = pattern.sections[secIndex];
        if (targetSection.hasParts && (parts[3] === "a" || parts[3] === "b")) {
          const subQ = targetSection.subQuestions?.[parts[3] === "a" ? 0 : 1];
          if (subQ?.questionCategory && subQ.questionCategory !== "ANY")
            return subQ.questionCategory;
        }
      }
    }
    return targetSection?.questionCategory &&
      targetSection.questionCategory !== "ANY"
      ? targetSection.questionCategory
      : null;
  }, [activeTab, activeSection, paperData]);

  const getCurrentLimit = useCallback(() => {
    const sections =
      paperData?.selectedPattern?.sections ||
      paperData?.paperPattern?.sections ||
      [];
    if (sections.length === 0) return 0;
    if (activeTab === "MCQ") {
      const mcqSection = sections.find(
        (s) => String(s.questionType).toUpperCase() === "MCQ",
      );
      return mcqSection
        ? parseInt(mcqSection.totalQuestions || mcqSection.quantity || 0)
        : 0;
    }
    if (!activeSection) return 0;
    const realIndex = parseInt(activeSection.split("_")[1]);
    if (!isNaN(realIndex) && sections[realIndex]) {
      return activeTab === "LONG"
        ? 1
        : parseInt(sections[realIndex].totalQuestions || 0);
    }
    return 0;
  }, [paperData, activeTab, activeSection]);

  const handleToggleSelect = useCallback(
    (clickedQuestion) => {
      const targetID = String(clickedQuestion._id);
      setTempSelected((prev) => {
        if (prev.some((q) => getSafeID(q) === targetID))
          return prev.filter((q) => getSafeID(q) !== targetID);
        const limit = getCurrentLimit();
        let currentCount = 0;
        let sectionIdToSave = null;
        if (activeTab === "MCQ") {
          currentCount = prev.filter(
            (q) => String(q.type).toUpperCase() === "MCQ",
          ).length;
          sectionIdToSave = "MCQ";
        } else {
          if (!activeSection) {
            setTimeout(
              () =>
                toast.error(
                  "Please select a Question Number (Q.2, Q.3) first!",
                ),
              0,
            );
            return prev;
          }
          currentCount = prev.filter((q) => q.tabId === activeSection).length;
          sectionIdToSave = activeSection;
        }
        if (limit > 0 && currentCount >= limit) {
          setTimeout(
            () =>
              toast.error(
                `Limit Reached! (${currentCount}/${limit}) selected.`,
              ),
            0,
          );
          return prev;
        }
        return [...prev, { ...clickedQuestion, tabId: sectionIdToSave }];
      });
    },
    [activeTab, activeSection, getCurrentLimit, getSafeID],
  );

  const handleAutoSelect = useCallback(() => {
    if (availablePool.length === 0)
      return toast.error("No questions available to auto-select!");
    const limit = getCurrentLimit();
    const currentCount =
      activeTab === "MCQ"
        ? tempSelected.filter((q) => String(q.type).toUpperCase() === "MCQ")
            .length
        : tempSelected.filter((q) => q.tabId === activeSection).length;
    const needed = limit - currentCount;
    if (needed <= 0) return toast.error("Section is already full!");

    let options = { avoidChapters: [], targetDifficulty: null };
    if (
      activeTab === "LONG" &&
      activeSection?.includes("_") &&
      activeSection.split("_")[3] === "b"
    ) {
      const questionA = tempSelected.find(
        (q) => q.tabId === activeSection.replace("_b", "_a"),
      );
      if (questionA) {
        if (questionA.chapter?._id || questionA.chapter)
          options.avoidChapters.push(
            questionA.chapter?._id || questionA.chapter,
          );
        options.targetDifficulty =
          questionA.difficulty === "Hard" || questionA.difficulty === "Easy"
            ? "Medium"
            : "Hard";
      }
    }
    const newSelection = generateAutoSelection(
      availablePool,
      needed,
      tempSelected.map((q) => q._id),
      options,
    );
    if (newSelection.length === 0)
      return toast.error("Could not find suitable questions.");
    setTempSelected((prev) => [
      ...prev,
      ...newSelection.map((q) => ({ ...q, tabId: activeSection || "MCQ" })),
    ]);
    setCustomToast(
      `${newSelection.length} questions have been selected randomly.`,
    );
    setTimeout(() => setCustomToast(null), 3500);
  }, [availablePool, activeTab, activeSection, tempSelected, getCurrentLimit]);

  const validateSelection = () => {
    let sections = paperData?.selectedPattern?.sections || [];
    const mcqSec = sections.find(
      (s) => String(s.questionType).toUpperCase() === "MCQ",
    );
    if (mcqSec) {
      const limit = parseInt(mcqSec.totalQuestions || mcqSec.quantity || 0);
      const count = tempSelected.filter(
        (q) => String(q.type).toUpperCase() === "MCQ",
      ).length;
      if (count > 0 && count < limit)
        return `Objective Part requires exactly ${limit} MCQs, but you selected ${count}.`;
    }
    const shortSections = sections.filter(
      (s) => String(s.questionType).toUpperCase() === "SHORT",
    );
    for (let i = 0; i < shortSections.length; i++) {
      const realIndex = sections.indexOf(shortSections[i]);
      const secId = `sec_${realIndex}`;
      const limit = parseInt(
        shortSections[i].totalQuestions || shortSections[i].quantity || 0,
      );
      let count = tempSelected.filter((q) => q.tabId === secId).length;
      if (count === 0)
        count = tempSelected.filter(
          (q) => String(q.tabId) === String(realIndex),
        ).length;
      if (count > 0 && count < limit)
        return `Q.${i + 2} (Short Questions) requires exactly ${limit} questions, but you selected ${count}.`;
    }
    const longSections = sections.filter(
      (s) => String(s.questionType).toUpperCase() === "LONG",
    );
    let startQNum = shortSections.length + 2;
    for (let i = 0; i < longSections.length; i++) {
      const realIndex = sections.indexOf(longSections[i]);
      const limit = parseInt(
        longSections[i].totalQuestions || longSections[i].quantity || 0,
      );
      const sec = longSections[i];
      for (let j = 0; j < limit; j++) {
        const qNum = startQNum + j;
        if (sec.hasParts) {
          const countA = tempSelected.filter(
            (q) => q.tabId === `long_${realIndex}_${j}_a`,
          ).length;
          const countB = tempSelected.filter(
            (q) => q.tabId === `long_${realIndex}_${j}_b`,
          ).length;
          if (countA === 1 && countB === 0)
            return `In Q.${qNum}, you selected part (a) but part (b) is missing!`;
          if (countB === 1 && countA === 0)
            return `In Q.${qNum}, you selected part (b) but part (a) is missing!`;
        }
      }
      startQNum += limit;
    }
    return null;
  };

  const handleConfirmAdd = () => {
    const errorMsg = validateSelection();
    if (errorMsg) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Section",
        text: errorMsg,
        confirmButtonColor: "#3b82f6",
        background: theme === "dark" ? "#1e293b" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#1e293b",
        customClass: { container: "z-[99999]" }, // ✅ FIXED Z-INDEX FOR SWEETALERT IN MODAL
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      if (onAddQuestionsToPaper)
        onAddQuestionsToPaper(tempSelected, "REPLACE_ALL");
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  // ✅ Fixed Tabs count logic using proper uppercase comparison
  const typeCounts = useMemo(() => {
    const counts = {
      MCQ: { total: 0, current: 0 },
      SHORT: { total: 0, current: 0 },
      LONG: { total: 0, current: 0 },
    };
    const sections =
      paperData?.selectedPattern?.sections ||
      paperData?.paperPattern?.sections ||
      [];
    sections.forEach((sec) => {
      const type = String(sec.questionType || "").toUpperCase();
      let qty = parseInt(sec.totalQuestions || sec.quantity) || 0;
      if (type === "LONG" && sec.hasParts) qty *= 2;
      if (counts[type]) counts[type].total += qty;
    });
    if (tempSelected) {
      counts.MCQ.current = tempSelected.filter(
        (q) => String(q.type).toUpperCase() === "MCQ",
      ).length;
      counts.SHORT.current = tempSelected.filter(
        (q) => String(q.type).toUpperCase() === "SHORT",
      ).length;
      counts.LONG.current = tempSelected.filter(
        (q) => String(q.type).toUpperCase() === "LONG",
      ).length;
    }
    return counts;
  }, [paperData, tempSelected]);

  const questionsForFooter = useMemo(
    () =>
      activeTab === "MCQ"
        ? tempSelected.filter((q) => String(q.type).toUpperCase() === "MCQ")
        : activeSection
          ? tempSelected.filter((q) => q.tabId === activeSection)
          : [],
    [tempSelected, activeTab, activeSection],
  );
  const isSelectionChanged = useMemo(
    () =>
      JSON.stringify((selectedQuestions || []).map(getSafeID).sort()) !==
      JSON.stringify(tempSelected.map(getSafeID).sort()),
    [tempSelected, selectedQuestions, getSafeID],
  );

  return (
    <div
      className={`fixed inset-0 z-2000 flex justify-center items-center bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <div
        className={`relative w-[95vw] h-[95vh] bg-bg-body text-main rounded-xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-3000 flex justify-center items-center">
            <Loader fullScreen={false} text="Updating Paper..." />
          </div>
        )}

        <MenuHeader
          paperData={paperData}
          onClose={onClose}
          onEditPreset={onEditPattern}
        />

        {/* ✅ ENTIRE BODY IS SCROLLABLE (SOLVES LAYOUT ISSUE) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="bg-card pt-4 px-6 z-10 relative shrink-0 border-b border-border">
            <MenuFilters
              filters={filters}
              setFilters={setFilters}
              categoriesList={categoriesList}
              difficultiesList={difficultiesList}
              loading={loadingFilters}
              availablePool={availablePool}
              onSelectQuestion={handleToggleSelect}
            />
            <TypeTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              typeCounts={typeCounts}
              paperData={paperData}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              selectedQuestions={tempSelected}
            />
          </div>

          {/* 1. AVAILABLE QUESTIONS (Fixed height so virtualizer works, scroll to see more) */}
          <div className="shrink-0">
            <QuestionList
              filters={filters}
              activeTab={activeTab}
              paperData={paperData}
              tempSelected={tempSelected}
              onToggleSelect={handleToggleSelect}
              requiredChapters={targetChapters}
              requiredCategory={targetCategory}
              onDataLoaded={setAvailablePool}
            />
          </div>

          {/* 2. ACTION BAR / BUTTONS (Moved to bottom of available list) */}
          <div className="shrink-0 p-6 bg-card border-y border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleAutoSelect}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3.5 rounded-lg font-extrabold text-[1rem] cursor-pointer flex items-center gap-2 transition-all shadow-md"
              >
                <FaRobot /> RANDOM SELECT
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[0.75rem] uppercase font-bold text-muted tracking-wider block mb-1">
                  Total Selected
                </span>
                <span className="text-[1.2rem] font-extrabold text-main leading-none">
                  {questionsForFooter.length}{" "}
                  <span className="text-[0.8rem] text-muted">
                    / {getCurrentLimit()}
                  </span>
                </span>
              </div>
              <button
                onClick={handleConfirmAdd}
                disabled={
                  questionsForFooter.length === 0 && !isSelectionChanged
                }
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-none px-8 py-3.5 rounded-lg font-extrabold text-[1rem] cursor-pointer flex items-center gap-2 shadow-md transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                ADD QUESTIONS <FaCheck />
              </button>
            </div>
          </div>

          {/* 3. SELECTED QUESTIONS (Below buttons, purely scrollable) */}
          <div className="shrink-0 bg-bg-body p-6 min-h-[40vh]">
            <h3 className="text-[1.2rem] font-bold text-main mb-4 border-b border-border pb-3">
              Selected Questions ({questionsForFooter.length})
            </h3>
            {questionsForFooter.length === 0 ? (
              <p className="text-muted text-center italic mt-10">
                No questions selected yet. Scroll up to add some!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {questionsForFooter.map((q, i) => {
                  const isUrdu = q.statement?.ur;
                  return (
                    <div
                      key={q._id}
                      className="flex justify-between items-center bg-card border border-border p-4 rounded-xl hover:border-accent-1 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4 w-full pr-4">
                        <span className="font-extrabold text-white bg-accent-1 px-2.5 py-1 rounded-md text-[0.95rem] mt-0.5">
                          {i + 1}.
                        </span>
                        <div
                          className={`flex-1 line-clamp-2 ${isUrdu ? "urdu-font text-xl text-right" : "text-[1rem] text-left"} leading-relaxed`}
                        >
                          <RenderText
                            text={
                              isUrdu
                                ? q.statement.ur
                                : q.statement?.en || "Question"
                            }
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSelect(q)}
                        title="Remove"
                        className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white p-3 rounded-lg transition-all shrink-0"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CUSTOM BOUNCY TOAST (Alert) */}
        <div
          className={`absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-5000 bg-white border border-green-200 shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-full px-6 py-3 flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${customToast ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90 pointer-events-none"}`}
        >
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex justify-center items-center shrink-0">
            <FaCheckCircle size={18} />
          </div>
          <span className="font-extrabold text-black text-[1.05rem] whitespace-nowrap">
            Random Selection Complete!
          </span>
          <span className="text-slate-500 font-medium text-[0.9rem] ml-1 border-l border-slate-200 pl-3 whitespace-nowrap">
            {customToast}
          </span>
        </div>
      </div>
    </div>
  );
};
export default React.memo(QuestionMenu);
