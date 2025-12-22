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

    let initialData = null;
    let initialMenuState = true;

    // CASE A: REFRESH -> Load from Storage
    if (savedKey === currentKey) {
      const savedData = localStorage.getItem("currentPaperData");
      const savedMenu = localStorage.getItem("isMenuOpen");

      if (savedData) initialData = JSON.parse(savedData);

      if (savedMenu !== null) {
        initialMenuState = JSON.parse(savedMenu);
      } else {
        initialMenuState = false;
      }
    }
    // CASE B: NEW SESSION -> Reset
    else {
      localStorage.removeItem("currentPaperData");
      localStorage.removeItem("isMenuOpen");
      localStorage.setItem("paperSessionKey", currentKey);

      initialData = location.state;
      if (initialData && !initialData.questions) {
        initialData = { ...initialData, questions: [] };
      }
      initialMenuState = true;
    }

    return { data: initialData, menuOpen: initialMenuState };
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
  // ✅ 3. HANDLERS (Fixed Cancel Logic)
  // ============================================================

  // ✅ UPDATED CANCEL HANDLER
  const handleCancelPaper = () => {
    if (
      window.confirm(
        "Are you sure you want to discard this paper? (Pattern changes will be saved)"
      )
    ) {
      // 1. Clear Local Storage (Session Data)
      localStorage.removeItem("currentPaperData");
      localStorage.removeItem("paperSessionKey");
      localStorage.removeItem("isMenuOpen");

      // 2. Navigate Back WITH UPDATED PATTERN
      // Hum 'state' mein updated pattern bhej rahe hain taake pichla page use pakar le
      navigate("/user/generate-paper", {
        state: {
          savedPattern: paperData.selectedPattern, // Ye wo pattern hai jo abhi edit hua
          isReturning: true,
        },
      });
    }
  };

  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prevData) => {
      let currentQuestions = [...prevData.questions];
      const sections = updatedPattern.sections || [];

      // Logic to remove extra questions if limit reduced
      sections.forEach((sec, index) => {
        const type = sec.questionType;
        const sectionId = type === "MCQ" ? "MCQ" : `sec_${index}`;

        let sectionQuestions = currentQuestions.filter((q) => {
          if (type === "MCQ") return q.type === "MCQ";
          return q.tabId === sectionId;
        });

        const limit = parseInt(sec.totalQuestions || sec.quantity || 0);

        if (sectionQuestions.length > limit) {
          const allowedIds = sectionQuestions.slice(0, limit).map((q) => q._id);
          currentQuestions = currentQuestions.filter((q) => {
            if (type === "MCQ" && q.type === "MCQ")
              return allowedIds.includes(q._id);
            if (q.tabId === sectionId) return allowedIds.includes(q._id);
            return true;
          });
        }

        if (type === "LONG") {
          // Clear Long questions on edit to avoid Parts conflict
          // (User can re-select, safer approach)
          const conflicts = sectionQuestions.some((q) => true);
          if (conflicts) {
            currentQuestions = currentQuestions.filter(
              (q) => q.tabId !== sectionId
            );
          }
        }
      });

      return {
        ...prevData,
        selectedPattern: updatedPattern,
        questions: currentQuestions,
      };
    });

    setShowPatternEdit(false);
    toast.success("Pattern Updated!");
  };

  const handleAddQuestionsToPaper = (newQuestions, sectionId) => {
    if (!newQuestions || newQuestions.length === 0) return;
    const typeToAdd = newQuestions[0].type;

    setPaperData((prevData) => {
      const existingQuestions = prevData.questions || [];
      const filteredQuestions = existingQuestions.filter((q) => {
        if (typeToAdd === "MCQ") return q.type !== "MCQ";
        return q.tabId !== sectionId;
      });

      const updatedQuestions = [...filteredQuestions, ...newQuestions];
      console.log("📝 Paper Updated:", updatedQuestions.length);
      return { ...prevData, questions: updatedQuestions };
    });

    if (typeof toast !== "undefined") {
      toast.success("Questions Added!", {
        icon: "✅",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
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
