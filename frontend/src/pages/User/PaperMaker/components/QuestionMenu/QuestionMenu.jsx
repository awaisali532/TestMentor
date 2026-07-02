import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import MenuHeader from "./components/MenuHeader";
import MenuFilters from "./components/MenuFilters";
import TypeTabs from "./components/TypeTabs";
import QuestionList from "./components/QuestionList";
import MenuFooter from "./components/MenuFooter";
import Loader from "../../../../../components/ui/Loader"; // ✅ Added Loader
import { useTheme } from "../../../../../context/ThemeContext"; // ✅ Theme for Swal
import { getCategoriesForSubject } from "../../../../../config/SubjectConfig";
import { generateAutoSelection } from "../../../../../utils/AutoPaperGenerator";

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
  const [isProcessing, setIsProcessing] = useState(false); // ✅ Internal Loader State

  const [activeTab, setActiveTab] = useState("MCQ");
  const [activeSection, setActiveSection] = useState(null);
  const [filters, setFilters] = useState({ category: [], difficulty: [] });
  const [show, setShow] = useState(false);
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

  const getSafeID = useCallback((q) => {
    if (!q) return "";
    return typeof q.questionId === "object"
      ? String(q.questionId._id)
      : String(q.questionId || q._id);
  }, []);

  // Sync state when menu opens
  useEffect(() => {
    if (isOpen && paperData?.questions) setTempSelected(paperData.questions);
  }, [isOpen]);

  useEffect(() => {
    if (paperData?.questions) setTempSelected(paperData.questions);
  }, [paperData?.selectedPattern]);

  useEffect(() => {
    if (paperData?.selectedPattern && activeSection) setActiveSection(null);
  }, [paperData?.selectedPattern]);

  useEffect(() => {
    setActiveSection(null);
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) setShow(true);
    else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const targetChapters = useMemo(() => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    if (!pattern?.sections) return null;
    let targetSection = null;
    if (activeTab === "MCQ")
      targetSection = pattern.sections.find((s) => s.questionType === "MCQ");
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
      const mcqSection = sections.find((s) => s.questionType === "MCQ");
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
          currentCount = prev.filter((q) => q.type === "MCQ").length;
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

  // ✅ AUTO SELECT FIX (Issue 6 & 7) - Clean Single Toast
  const handleAutoSelect = useCallback(() => {
    if (availablePool.length === 0)
      return toast.error("No questions available to auto-select!");
    const limit = getCurrentLimit();
    const currentCount =
      activeTab === "MCQ"
        ? tempSelected.filter((q) => q.type === "MCQ").length
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

    if (newSelection.length === 0) {
      return toast.error("Could not find suitable questions.");
    }

    setTempSelected((prev) => [
      ...prev,
      ...newSelection.map((q) => ({ ...q, tabId: activeSection || "MCQ" })),
    ]);

    // Beautiful single toast
    toast.success(
      `🤖 Auto-selected ${newSelection.length} questions successfully!`,
      {
        style: {
          borderRadius: "10px",
          background: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#fff" : "#333",
        },
      },
    );
  }, [
    availablePool,
    activeTab,
    activeSection,
    tempSelected,
    getCurrentLimit,
    theme,
  ]);

  // ✅ STRICT VALIDATION LOGIC (Issue 8)
  const validateSelection = () => {
    let sections = paperData?.selectedPattern?.sections || [];

    // 1. Check MCQ
    const mcqSec = sections.find((s) => s.questionType === "MCQ");
    if (mcqSec) {
      const limit = parseInt(mcqSec.totalQuestions || mcqSec.quantity || 0);
      const count = tempSelected.filter((q) => q.type === "MCQ").length;
      if (count > 0 && count < limit)
        return `Objective Part requires exactly ${limit} MCQs, but you selected ${count}.`;
    }

    // 2. Check Shorts
    const shortSections = sections.filter((s) => s.questionType === "SHORT");
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

    // 3. Check Longs
    const longSections = sections.filter((s) => s.questionType === "LONG");
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

    return null; // Passes Validation
  };

  // ✅ CONFIRM ADD (With Loader and Validation Check)
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
      });
      return;
    }

    // Start processing loader
    setIsProcessing(true);
    setTimeout(() => {
      if (onAddQuestionsToPaper)
        onAddQuestionsToPaper(tempSelected, "REPLACE_ALL");
      setIsProcessing(false);
      onClose(); // Automatically close modal after update
    }, 500); // 500ms smooth delay for UI feel
  };

  const typeCounts = useMemo(() => {
    const counts = {
      MCQ: { total: 0, current: 0 },
      SHORT: { total: 0, current: 0 },
      LONG: { total: 0, current: 0 },
    };
    (
      paperData?.selectedPattern?.sections ||
      paperData?.paperPattern?.sections ||
      []
    ).forEach((sec) => {
      let qty = parseInt(sec.totalQuestions || sec.quantity) || 0;
      if (sec.questionType === "LONG" && sec.hasParts) qty *= 2;
      if (counts[sec.questionType]) counts[sec.questionType].total += qty;
    });
    if (tempSelected) {
      counts.MCQ.current = tempSelected.filter((q) => q.type === "MCQ").length;
      counts.SHORT.current = tempSelected.filter(
        (q) => q.type === "SHORT",
      ).length;
      counts.LONG.current = tempSelected.filter(
        (q) => q.type === "LONG",
      ).length;
    }
    return counts;
  }, [paperData, tempSelected]);

  const questionsForFooter = useMemo(
    () =>
      activeTab === "MCQ"
        ? tempSelected.filter((q) => q.type === "MCQ")
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

  if (!show) return null;

  return (
    // ✅ CENTERED MODAL FIX (Issue 10)
    <div
      className={`fixed inset-0 z-2000 flex justify-center items-center bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      {/* 2. CENTERED MODAL (Reference image ki tarah height/width set ki hai) */}
      <div
        className={`relative w-[85vw] max-w-400 h-[85vh] bg-card text-main border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-transform duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* ✅ INSIDE PROCESSING LOADER */}
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

        <div className="flex-1 flex flex-col overflow-hidden bg-bg-body">
          <div className="bg-card border-b border-border pt-4 px-5 z-10 relative">
            {/* ✅ AVAILABLE IN DB COUNT (Issue 16) */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <MenuFilters
                  filters={filters}
                  setFilters={setFilters}
                  categoriesList={categoriesList}
                  difficultiesList={difficultiesList}
                  loading={loadingFilters}
                />
              </div>
              <div className="shrink-0 mt-6 hidden sm:block">
                <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5 text-right">
                  Available Pool
                </span>
                <div className="text-sm font-extrabold bg-emerald-500/10 text-emerald-600 px-4 py-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2 shadow-sm">
                  <span className="text-lg">{availablePool.length}</span>{" "}
                  Questions
                </div>
              </div>
            </div>

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

          <div className="flex-1 overflow-y-auto p-5 pb-25 custom-scrollbar relative">
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

          <MenuFooter
            count={questionsForFooter.length}
            limit={getCurrentLimit()}
            sectionLabel={
              activeSection
                ? activeSection.replace(/_/g, " ").toUpperCase()
                : activeTab === "MCQ"
                  ? "MCQ SECTION"
                  : "SECTION"
            }
            onAdd={handleConfirmAdd}
            onAutoSelect={handleAutoSelect}
            isChanged={isSelectionChanged}
            selectedQuestions={questionsForFooter}
            onRemove={handleToggleSelect}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuestionMenu);
