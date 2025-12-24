import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import toast, { Toaster } from "react-hot-toast";
import MakerSidebar from "../../../components/PaperMaker/MakerSidebar/MakerSidebar";
import PaperPreview from "../../../components/PaperMaker/PaperPreview/PaperPreview";
import QuestionMenu from "../../../components/PaperMaker/QuestionMenu/QuestionMenu";
import PatternForm from "../../Admin/PaperPatterns/PatternForm";
import SavePaperModal from "../../../components/PaperMaker/SaveModal/SavePaperModal";
import "./PaperMaker.css";

const PaperMaker = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // --- Session State Logic ---
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Effects ---
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

  // Prevent accidental back/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (!paperData) return null;

  // --- Handlers ---

  const handleCancelPaper = () => {
    window.onbeforeunload = null;
    localStorage.removeItem("currentPaperData");
    localStorage.removeItem("paperSessionKey");
    localStorage.removeItem("isMenuOpen");
    navigate("/user/dashboard");
  };

  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prevData) => {
      let currentQuestions = [...prevData.questions];
      const newSections = updatedPattern.sections || [];

      currentQuestions = currentQuestions.filter((q) => {
        if (q.type === "MCQ") return true;
        if (!q.tabId) return true;

        const parts = q.tabId.split("_");
        const secIndex = parseInt(parts[1]);
        const targetSection = newSections[secIndex];

        if (!targetSection) return false;

        if (q.type === "SHORT") {
          return targetSection.questionType === "SHORT";
        }

        if (q.type === "LONG") {
          if (targetSection.questionType !== "LONG") return false;
          const isFull = q.tabId.endsWith("_full");
          const isPart = q.tabId.endsWith("_a") || q.tabId.endsWith("_b");

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

  const handleAddQuestionsToPaper = (incomingQuestions, typeToUpdate) => {
    setPaperData((prevData) => {
      const existingQuestions = prevData.questions || [];
      const keepQuestions = existingQuestions.filter(
        (q) => q.type !== typeToUpdate
      );
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

  // ============================================================
  // ✅ SMART SAVE LOGIC (Update vs Create)
  // ============================================================
  const handleSaveToDatabase = async (paperTitle) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Payload tayyar karein
      const payload = {
        title: paperTitle,
        subject: paperData.subject,
        grade: paperData.grade,
        totalMarks: paperData.selectedPattern?.totalMarks || 0,
        pattern: paperData.selectedPattern,
        // ✅ Question ID handling (Live vs Saved)
        questions: paperData.questions.map((q) => ({
          questionId: q._id || q.questionId,
          statement: q.statement,
          type: q.type,
          options: q.options,
          marks: q.marks,
          tabId: q.tabId,
        })),
      };

      let apiUrl = `${BASE_URL}/api/papers/save`;
      let method = "post"; // Default: New Create
      let isUpdate = false;

      // Check 1: Agar Paper ID hai AUR Title same hai -> UPDATE
      if (paperData._id && paperData.title === paperTitle) {
        apiUrl = `${BASE_URL}/api/papers/${paperData._id}`;
        method = "put";
        isUpdate = true;
      }
      // Check 2: Agar Paper ID hai lekin Title CHANGE ho gaya -> CONFIRM NEW
      else if (paperData._id && paperData.title !== paperTitle) {
        const confirmNew = window.confirm(
          "You changed the paper name. This will create a NEW paper file.\n\nClick OK to Create New, or Cancel to edit name."
        );
        if (!confirmNew) {
          setSaving(false);
          return; // Rukk jao agar user cancel kare
        }
        // Method POST hi rahega (Create New)
      }

      // API Call
      const res = await axios[method](apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(
          isUpdate
            ? "Paper Updated Successfully!"
            : "New Paper Saved Successfully!"
        );

        // Cleanup & Redirect
        window.onbeforeunload = null;
        localStorage.removeItem("currentPaperData");
        localStorage.removeItem("paperSessionKey");
        localStorage.removeItem("isMenuOpen");

        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save paper.");
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  };

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
        onSave={() => setShowSaveModal(true)}
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
        selectedQuestions={paperData.questions || []}
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

      {/* ✅ Pass initialTitle so input is pre-filled */}
      <SavePaperModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveToDatabase}
        loading={saving}
        initialTitle={paperData.title}
      />
    </div>
  );
};

export default PaperMaker;
