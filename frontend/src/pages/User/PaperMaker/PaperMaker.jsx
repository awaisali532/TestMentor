import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import toast, { Toaster } from "react-hot-toast";
import MakerSidebar from "../../../components/PaperMaker/MakerSidebar/MakerSidebar";
import PaperPreview from "../../../components/PaperMaker/PaperPreview/PaperPreview";
import QuestionMenu from "../../../components/PaperMaker/QuestionMenu/QuestionMenu";
import PatternForm from "../../Admin/PaperPatterns/PatternForm";
import "./PaperMaker.css";

const PaperMaker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // 1. SMART INITIALIZATION
  const [sessionState, setSessionState] = useState(() => {
    const savedKey = localStorage.getItem("paperSessionKey");
    const currentKey = location.key;

    if (savedKey === currentKey) {
      const savedData = localStorage.getItem("currentPaperData");
      const savedMenu = localStorage.getItem("isMenuOpen");
      return {
        data: savedData ? JSON.parse(savedData) : null,
        menuOpen: savedMenu ? JSON.parse(savedMenu) : false,
      };
    } else {
      localStorage.removeItem("currentPaperData");
      localStorage.removeItem("isMenuOpen");
      localStorage.setItem("paperSessionKey", currentKey);

      let initialData = location.state;
      if (initialData && !initialData.questions) {
        initialData = { ...initialData, questions: [] };
      }
      return { data: initialData, menuOpen: true };
    }
  });

  const [paperData, setPaperData] = useState(sessionState.data);
  const [isMenuOpen, setIsMenuOpen] = useState(sessionState.menuOpen);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPatternEdit, setShowPatternEdit] = useState(false);

  // 2. EFFECTS
  useEffect(() => {
    if (!paperData) {
      navigate("/user/generate-paper");
    }
  }, [paperData, navigate]);

  useEffect(() => {
    if (paperData) {
      localStorage.setItem("currentPaperData", JSON.stringify(paperData));
    }
  }, [paperData]);

  useEffect(() => {
    localStorage.setItem("isMenuOpen", JSON.stringify(isMenuOpen));
  }, [isMenuOpen]);

  if (!paperData) return null;

  // 3. HANDLERS

  // ✅ FIXED: CANCEL -> GO TO DASHBOARD & RESET
  const handleCancelPaper = () => {
    // 1. Clear Storage
    localStorage.removeItem("currentPaperData");
    localStorage.removeItem("paperSessionKey");
    localStorage.removeItem("isMenuOpen");

    // 2. Navigate to Dashboard
    navigate("/user/dashboard");
  };

  // ✅ FIXED: PATTERN UPDATE (Safe Mode)
  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prevData) => {
      let currentQuestions = [...prevData.questions];
      const newSections = updatedPattern.sections || [];

      currentQuestions = currentQuestions.filter((q) => {
        if (q.type === "MCQ") return true; // Keep MCQs safe
        if (!q.tabId) return true; // Keep safe if ID missing

        const parts = q.tabId.split("_");
        const secIndex = parseInt(parts[1]);
        const targetSection = newSections[secIndex];

        if (!targetSection) return false; // Section deleted

        // SHORT Questions: Keep them unless section deleted
        if (q.type === "SHORT") {
          return targetSection.questionType === "SHORT";
        }

        // LONG Questions: Check Parts logic
        if (q.type === "LONG") {
          if (targetSection.questionType !== "LONG") return false;
          const isFull = q.tabId.endsWith("_full");
          const isPart = q.tabId.endsWith("_a") || q.tabId.endsWith("_b");

          // Mismatch logic: Pattern says Parts, Q is Full (or vice versa) -> Delete
          if (targetSection.hasParts && isFull) return false;
          if (!targetSection.hasParts && isPart) return false;

          return true;
        }
        return true;
      });

      return {
        ...prevData,
        selectedPattern: updatedPattern,
        questions: currentQuestions,
      };
    });

    setShowPatternEdit(false);
    toast.success("Pattern Updated Successfully!");
  };

  // ============================================================
  // ✅ CRITICAL FIX: ADD QUESTIONS (MERGE, DON'T OVERWRITE)
  // ============================================================
  const handleAddQuestionsToPaper = (incomingQuestions, typeToUpdate) => {
    // typeToUpdate (MCQ, SHORT, LONG) is required here.
    // QuestionMenu must send it (check QuestionMenu update from previous step).

    setPaperData((prevData) => {
      const existingQuestions = prevData.questions || [];

      // 1. Filter OUT questions of the SAME TYPE being updated.
      // (Taake purana Short data saaf ho jaye aur naya aaye,
      //  LEKIN Long aur MCQ data ko hath na lage).
      const questionsToKeep = existingQuestions.filter(
        (q) => q.type !== typeToUpdate
      );

      // 2. Merge: Kept Questions + New Incoming Questions
      const newFullList = [...questionsToKeep, ...incomingQuestions];

      return {
        ...prevData,
        questions: newFullList,
      };
    });

    if (incomingQuestions.length > 0) {
      toast.success(`${typeToUpdate} Added Successfully!`);
    } else {
      toast(`${typeToUpdate} Cleared!`, { icon: "🗑️" });
    }
  };

  const currentPaperQuestions = paperData.questions || [];

  return (
    <div
      className={`pm-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      <MakerSidebar
        paperData={paperData}
        onOpenMenu={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        // ✅ Passing the Dashboard Redirect Handler
        onCancel={handleCancelPaper}
      />

      <div className="pm-workspace">
        <PaperPreview
          paperData={paperData}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      </div>

      <QuestionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        paperData={paperData}
        isSidebarCollapsed={isSidebarCollapsed}
        onEditPattern={() => setShowPatternEdit(true)}
        onAddQuestionsToPaper={handleAddQuestionsToPaper}
        selectedQuestions={currentPaperQuestions}
      />

      {showPatternEdit && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-content">
            <PatternForm
              onClose={() => setShowPatternEdit(false)}
              initialData={paperData.selectedPattern}
              isUserMode={true}
              onSuccess={handlePatternUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperMaker;
