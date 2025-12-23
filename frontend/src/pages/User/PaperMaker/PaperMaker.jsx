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

  // ============================================================
  // 1. SMART INITIALIZATION
  // ============================================================
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

  // ============================================================
  // 2. EFFECTS
  // ============================================================
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

  // ============================================================
  // 3. HANDLERS
  // ============================================================

  const handleCancelPaper = () => {
    if (window.confirm("Discard paper and return?")) {
      localStorage.removeItem("currentPaperData");
      localStorage.removeItem("paperSessionKey");
      localStorage.removeItem("isMenuOpen");
      navigate("/user/dashboard");
    }
  };

  // ============================================================
  // ✅ FIXED: HANDLE PATTERN UPDATE (INDEX MATCHING FIXED)
  // ============================================================
  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prevData) => {
      let currentQuestions = [...prevData.questions];
      const newSections = updatedPattern.sections || [];

      // Filter Logic
      currentQuestions = currentQuestions.filter((q) => {
        // 1. Keep MCQs Safe
        if (q.type === "MCQ") return true;

        // Safety Check for ID
        if (!q.tabId) return true;

        // Parse ID: e.g., "sec_0" means 0th Short Section
        const parts = q.tabId.split("_");
        // part[1] is the index WITHIN that specific type
        const secIndex = parseInt(parts[1]);

        // ---------------------------------------------
        // ✅ FIX FOR SHORT QUESTIONS
        // ---------------------------------------------
        if (q.type === "SHORT") {
          // Hum sirf SHORT type ke sections nikalenge
          const shortSections = newSections.filter(
            (s) => s.questionType === "SHORT"
          );

          // Check karein k kya ye wala Short Section abhi bhi exist krta hai?
          const targetSection = shortSections[secIndex];

          // Agar section exist karta hai -> KEEP IT (True)
          // Agar section delete ho gya -> DELETE IT (False)
          return !!targetSection;
        }

        // ---------------------------------------------
        // ✅ FIX FOR LONG QUESTIONS
        // ---------------------------------------------
        if (q.type === "LONG") {
          // Hum sirf LONG type ke sections nikalenge
          const longSections = newSections.filter(
            (s) => s.questionType === "LONG"
          );
          const targetSection = longSections[secIndex];

          // Agar Section hi nahi raha -> Delete
          if (!targetSection) return false;

          // Check Parts Structure (Strict Check)
          const isFullQuestion = q.tabId.endsWith("_full");
          const isPartQuestion =
            q.tabId.endsWith("_a") || q.tabId.endsWith("_b");

          // Case A: Pattern says Parts Yes, but Question is Full -> DELETE
          if (targetSection.hasParts && isFullQuestion) return false;

          // Case B: Pattern says Parts No, but Question is Part -> DELETE
          if (!targetSection.hasParts && isPartQuestion) return false;

          return true; // Structure matches -> Keep
        }

        return true; // Fallback
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
  // ✅ ADD QUESTIONS (MERGE, DON'T OVERWRITE)
  // ============================================================
  const handleAddQuestionsToPaper = (incomingQuestions, typeToUpdate) => {
    setPaperData((prevData) => {
      const existingQuestions = prevData.questions || [];

      // 1. Remove OLD questions of THIS TYPE only
      const keepQuestions = existingQuestions.filter(
        (q) => q.type !== typeToUpdate
      );

      // 2. Merge: Kept Questions + New Incoming Questions
      const newFullList = [...keepQuestions, ...incomingQuestions];

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
