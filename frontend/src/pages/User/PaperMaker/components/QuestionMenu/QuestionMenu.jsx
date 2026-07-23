import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
        ? parseInt(
            mcqSection.totalQuestions ||
              mcqSection.quantity ||
              mcqSection.toAttempt ||
              0,
          )
        : 0;
    }

    if (!activeSection) return 0;

    const realIndex = parseInt(activeSection.split("_")[1]);
    if (!isNaN(realIndex) && sections[realIndex]) {
      return activeTab === "LONG"
        ? 1
        : parseInt(
            sections[realIndex].totalQuestions ||
              sections[realIndex].quantity ||
              sections[realIndex].toAttempt ||
              0,
          );
    }
    return 0;
  }, [paperData, activeTab, activeSection]);

  // ✅ BULLETPROOF LOGIC: Stale Closure ko hamesha ke liye khatam kar diya
  const stateRef = useRef({
    activeTab,
    activeSection,
    tempSelected,
    getCurrentLimit,
  });

  useEffect(() => {
    stateRef.current = {
      activeTab,
      activeSection,
      tempSelected,
      getCurrentLimit,
    };
  }, [activeTab, activeSection, tempSelected, getCurrentLimit]);

  const handleToggleSelect = useCallback(
    (clickedQuestion) => {
      // Hamesha bilkul latest data read karega bina reload hue
      const {
        activeTab: currentTab,
        activeSection: currentSec,
        tempSelected: currentSel,
        getCurrentLimit: currentLimitFn,
      } = stateRef.current;

      const targetID = getSafeID(clickedQuestion);
      const isRemoving = currentSel.some((q) => getSafeID(q) === targetID);

      if (isRemoving) {
        setTempSelected((prev) =>
          prev.filter((q) => getSafeID(q) !== targetID),
        );
        return;
      }

      const limit = currentLimitFn();
      let currentCount = 0;
      let sectionIdToSave = null;

      if (currentTab === "MCQ") {
        currentCount = currentSel.filter(
          (q) => String(q.type).toUpperCase() === "MCQ",
        ).length;
        sectionIdToSave = "MCQ";
      } else {
        if (!currentSec) {
          toast.error("Please select a Question Number (Q.2, Q.3) first!");
          return;
        }
        const legacyId = currentSec.replace("sec_", "");
        currentCount = currentSel.filter(
          (q) => q.tabId === currentSec || String(q.tabId) === legacyId,
        ).length;
        sectionIdToSave = currentSec;
      }

      if (limit > 0 && currentCount >= limit) {
        toast.error(`Limit Reached! (${currentCount}/${limit}) selected.`);
        return;
      }

      setTempSelected((prev) => [
        ...prev,
        { ...clickedQuestion, tabId: sectionIdToSave },
      ]);
    },
    [getSafeID], // Khali dependency, ye kabhi purana data nahi le ga
  );

  const handleAutoSelect = useCallback(() => {
    if (availablePool.length === 0)
      return toast.error("No questions available to auto-select!");

    const limit = getCurrentLimit();
    if (limit <= 0) return toast.error("Invalid limit for this section.");

    const isMCQ = activeTab === "MCQ";
    const legacyId = activeSection ? activeSection.replace("sec_", "") : "";

    const currentTabQuestions = tempSelected.filter((q) =>
      isMCQ
        ? String(q.type).toUpperCase() === "MCQ"
        : q.tabId === activeSection || String(q.tabId) === legacyId,
    );

    const otherTabQuestions = tempSelected.filter((q) =>
      isMCQ
        ? String(q.type).toUpperCase() !== "MCQ"
        : q.tabId !== activeSection && String(q.tabId) !== legacyId,
    );

    const currentSelectedIds = currentTabQuestions.map((q) => q._id);
    let excludeIds = otherTabQuestions.map((q) => q._id);

    let options = { avoidChapters: [], targetDifficulty: null };
    if (
      !isMCQ &&
      activeTab === "LONG" &&
      activeSection?.includes("_") &&
      activeSection.split("_")[3] === "b"
    ) {
      const questionA = otherTabQuestions.find(
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

    const availableForThisTab = availablePool.filter(
      (q) => !excludeIds.includes(q._id),
    );
    if (availableForThisTab.length >= limit + currentSelectedIds.length) {
      excludeIds = [...excludeIds, ...currentSelectedIds];
    }

    const newSelection = generateAutoSelection(
      availablePool,
      limit,
      excludeIds,
      options,
    );

    if (newSelection.length === 0)
      return toast.error("Could not find suitable questions.");

    const formattedSelection = newSelection.map((q) => ({
      ...q,
      tabId: activeSection || "MCQ",
    }));
    setTempSelected([...otherTabQuestions, ...formattedSelection]);

    setCustomToast(`Fresh Random Questions Selected!`);
    setTimeout(() => setCustomToast(null), 3500);
  }, [availablePool, activeTab, activeSection, tempSelected, getCurrentLimit]);

  const validateSelection = () => {
    const limit = getCurrentLimit();
    let currentCount = 0;
    let sectionName = "";

    if (activeTab === "MCQ") {
      currentCount = tempSelected.filter(
        (q) => String(q.type).toUpperCase() === "MCQ",
      ).length;
      sectionName = "Objective Part (MCQs)";
    } else {
      const legacyId = activeSection ? activeSection.replace("sec_", "") : "";
      currentCount = tempSelected.filter(
        (q) => q.tabId === activeSection || String(q.tabId) === legacyId,
      ).length;
      sectionName = activeSection ? "Current Question Part" : "Current Section";
    }

    if (currentCount < limit) {
      return `Please fill the section completely! ${sectionName} requires exactly ${limit} questions, but you have selected ${currentCount}.`;
    }
    return null;
  };

  const handleConfirmAdd = () => {
    const errorMsg = validateSelection();
    if (errorMsg) {
      Swal.fire({
        icon: "warning",
        title: "Action Required",
        text: errorMsg,
        confirmButtonColor: "#3b82f6",
        background: theme === "dark" ? "#1e293b" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#1e293b",
        customClass: { container: "z-[99999]" },
        didOpen: () => {
          const container = document.querySelector(".swal2-container");
          if (container) container.style.zIndex = "99999";
        },
      });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      if (onAddQuestionsToPaper)
        onAddQuestionsToPaper(tempSelected, "REPLACE_ALL");
      setIsProcessing(false);
    }, 500);
  };

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
      let qty =
        parseInt(sec.totalQuestions || sec.quantity || sec.toAttempt) || 0;
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
          ? tempSelected.filter(
              (q) =>
                q.tabId === activeSection ||
                String(q.tabId) === activeSection.replace("sec_", ""),
            )
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

          <div className="shrink-0 bg-bg-body p-6 min-h-[40vh]">
            <h3 className="text-[1.2rem] font-bold text-main mb-4 border-b border-border pb-3">
              Selected Questions ({questionsForFooter.length})
            </h3>
            {questionsForFooter.length === 0 ? (
              <p className="text-muted text-center italic mt-10">
                No questions selected yet. Scroll up to add some!
              </p>
            ) : (
              <div className="flex flex-col border-t border-border">
                {questionsForFooter.map((q, i) => {
                  const textEn = q.statement?.en || "";
                  const textUr = q.statement?.ur || "";

                  const originalIndex = availablePool.findIndex(
                    (poolQ) => getSafeID(poolQ) === getSafeID(q),
                  );
                  const qNumberDisplay =
                    originalIndex !== -1 ? `Q.${originalIndex + 1}` : "Q.?";

                  return (
                    <div
                      key={q._id}
                      className="flex justify-between items-center bg-card border-b border-border py-2 px-3 hover:bg-pill-bg/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 w-full pr-4">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="font-extrabold text-white bg-accent-1 px-2 py-0.5 rounded text-[0.85rem] leading-none">
                            {i + 1}.
                          </span>
                          <span className="text-[0.6rem] font-bold text-muted bg-pill-bg px-1.5 py-0.5 rounded leading-none">
                            {qNumberDisplay}
                          </span>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-center">
                          {textEn && (
                            <div className="text-[0.9rem] font-medium leading-relaxed font-sans text-left line-clamp-2">
                              <RenderText text={textEn} />
                            </div>
                          )}
                          {textUr && (
                            <div
                              className="urdu-font text-lg leading-relaxed text-right line-clamp-2"
                              dir="rtl"
                            >
                              <RenderText text={textUr} />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSelect(q)}
                        title="Remove"
                        className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded transition-all shrink-0"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
