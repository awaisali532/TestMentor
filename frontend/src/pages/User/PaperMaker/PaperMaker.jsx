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

  // ✅ 1. State for Paper Data (Includes 'questions' array now)
  const [paperData, setPaperData] = useState(() => {
    // Initial State mein empty questions array rakhte hain
    const data = location.state;
    if (data && !data.questions) {
      return { ...data, questions: [] };
    }
    return data;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPatternEdit, setShowPatternEdit] = useState(false);

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

  // --- HANDLER: Update Pattern ---
  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prev) => ({
      ...prev,
      selectedPattern: updatedPattern,
    }));
    setShowPatternEdit(false);
  };

  // ============================================================
  // ✅ NEW HANDLER: ADD / OVERWRITE QUESTIONS
  // ============================================================
  const handleAddQuestionsToPaper = (newQuestions, sectionId) => {
    if (!newQuestions || newQuestions.length === 0) return;

    // 1. Identify Type (MCQ, SHORT, LONG) from the first question
    const typeToAdd = newQuestions[0].type;

    // Note: sectionId humein Menu se mil raha hai (e.g., "MCQ", "sec_0", "long_0_0_a")

    setPaperData((prevData) => {
      const existingQuestions = prevData.questions || [];

      // 2. OVERWRITE LOGIC:
      // Hum purane questions ko filter karenge.
      // Agar "tabId" match kar gaya, to usay remove kar denge taake naya data aa sake.

      const filteredQuestions = existingQuestions.filter((q) => {
        // Agar MCQ add kar rahe hain, to purane saare MCQs hata do
        if (typeToAdd === "MCQ") {
          return q.type !== "MCQ";
        }

        // Agar Short/Long hai, to sirf USI SECTION ke questions hatao (e.g. Q.2)
        // Baaki Q.3, Q.4 wese hi rahenge
        return q.tabId !== sectionId;
      });

      // 3. MERGE: Purane (Filtered) + Naye Questions
      const updatedQuestions = [...filteredQuestions, ...newQuestions];

      // Console log for debugging
      console.log(
        "📝 Paper Updated:",
        updatedQuestions.length,
        "questions total."
      );

      return {
        ...prevData,
        questions: updatedQuestions, // Update State
      };
    });

    // Note: Hum setIsMenuOpen(false) nahi kar rahe, taake user aur sections add kar sake.
  };

  // ✅ Helper to pass selected questions back to menu (For "Done" check or Re-edit)
  // Ye Menu ko batayega ke "Bhai ye questions pehle se added hain"
  const currentPaperQuestions = paperData.questions || [];

  return (
    <div
      className={`pm-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      <MakerSidebar
        paperData={paperData}
        onOpenMenu={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* ✅ PREVIEW AREA (Yahan update nazar ayega) */}
      <div className="pm-workspace">
        <PaperPreview
          paperData={paperData}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      </div>

      {/* ✅ QUESTION MENU (Connected) */}
      <QuestionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        paperData={paperData}
        isSidebarCollapsed={isSidebarCollapsed}
        onEditPattern={() => setShowPatternEdit(true)}
        onAddQuestionsToPaper={handleAddQuestionsToPaper}
        selectedQuestions={currentPaperQuestions}
      />

      {/* PATTERN EDIT MODAL */}
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
