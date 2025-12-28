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
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";
import "./PaperMaker.css";
import "../../../layouts/UserLayout/UserLayout.css";

const PaperMaker = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // --- SESSION MANAGEMENT ---
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

  // ✅ MANUAL EDIT MODE STATE
  const [isManualMode, setIsManualMode] = useState(false);

  // ✅ DELETE MODAL STATE
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    extra: null,
  });

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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (!paperData) return null;

  const handleCancelPaper = () => {
    window.onbeforeunload = null;
    localStorage.removeItem("currentPaperData");
    localStorage.removeItem("paperSessionKey");
    localStorage.removeItem("isMenuOpen");
    navigate("/user/dashboard");
  };

  // --- PATTERN UPDATE ---
  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prevData) => {
      let currentQuestions = [...prevData.questions];
      const oldLongSec = prevData.selectedPattern?.sections?.find(
        (s) => s.questionType === "LONG"
      );
      const newLongSec = updatedPattern.sections?.find(
        (s) => s.questionType === "LONG"
      );
      const isLongPatternChanged =
        oldLongSec?.hasParts !== newLongSec?.hasParts;

      currentQuestions = currentQuestions.filter((q) => {
        if (q.type === "MCQ") return true;
        if (q.type === "SHORT") {
          if (!q.tabId) return true;
          const parts = q.tabId.split("_");
          const secIndex = parseInt(parts[parts.length - 1]);
          if (isNaN(secIndex)) return true;
          const targetSection = updatedPattern.sections[secIndex];
          if (!targetSection) return true;
          if (targetSection.questionType !== "SHORT") return true;
          return true;
        }
        if (q.type === "LONG") {
          if (isLongPatternChanged) return false;
          if (!newLongSec) return false;
          const isFull = q.tabId.endsWith("_full");
          const isPart = q.tabId.endsWith("_a") || q.tabId.endsWith("_b");
          if (newLongSec.hasParts && isFull) return false;
          if (!newLongSec.hasParts && isPart) return false;
          return true;
        }
        return true;
      });

      if (isLongPatternChanged) toast("Long Questions reset.", { icon: "⚠️" });

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
      return { ...prevData, questions: newFullList };
    });
    if (incomingQuestions.length > 0) {
      toast.success(`${typeToUpdate} Added Successfully!`);
    } else {
      toast(`${typeToUpdate} Cleared!`, { icon: "🗑️" });
    }
  };

  // ✅ UPDATED PRINT HANDLER (Accepts Mode)
  const handlePrintPaper = (mode = "SINGLE") => {
    // Navigate to Print Page with Data AND Mode
    navigate("/user/print-paper", {
      state: {
        ...paperData,
        printSettings: { mode: mode }, // 👈 Ye naya data ja raha hai
      },
    });
  };

  // =========================================================
  // ✅ MANUAL EDITING HANDLERS
  // =========================================================

  // 1. Trigger Delete Modal for Single Question
  const handleManualDelete = (qId) => {
    setDeleteModal({ isOpen: true, type: "SINGLE", id: qId, extra: null });
  };

  // 2. Trigger Delete Modal for Section
  const handleSectionDelete = (type, tabIdPrefix = null) => {
    setDeleteModal({
      isOpen: true,
      type: "SECTION",
      id: type,
      extra: tabIdPrefix,
    });
  };

  // 3. EXECUTE DELETE
  const handleConfirmDelete = () => {
    const { type, id, extra } = deleteModal;

    setPaperData((prev) => {
      if (type === "SINGLE") {
        return {
          ...prev,
          questions: prev.questions.filter((q) => {
            const currentId = q.questionId?._id || q.questionId || q._id;
            return currentId !== id && q._id !== id;
          }),
        };
      }

      if (type === "SECTION") {
        return {
          ...prev,
          questions: prev.questions.filter((q) => {
            if (id === "MCQ" && q.type === "MCQ") return false;
            if (id === "LONG" && q.type === "LONG") return false;
            if (id === "SHORT" && q.type === "SHORT") {
              return extra ? !q.tabId?.startsWith(extra) : false;
            }
            return true;
          }),
        };
      }
      return prev;
    });

    setDeleteModal({ isOpen: false, type: null, id: null, extra: null });
    toast.success("Deleted successfully");
  };

  // 4. Update Question Content
  const handleManualUpdate = (qId, field, lang, value, optIndex = null) => {
    setPaperData((prev) => {
      const updatedQuestions = prev.questions.map((q) => {
        const id = q.questionId?._id || q.questionId || q._id;
        if (id === qId || q._id === qId) {
          if (field === "options" && optIndex !== null) {
            const newOptions = [...q.options];
            newOptions[optIndex] = {
              ...newOptions[optIndex],
              [lang]: value,
            };
            return { ...q, options: newOptions };
          }
          if (field === "statement") {
            return {
              ...q,
              statement: { ...q.statement, [lang]: value },
            };
          }
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  // =========================================================

  const handleSaveToDatabase = async (paperTitle) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ PREPARE DATA FOR SNAPSHOT SAVE
      const questionsToSave = paperData.questions.map((q) => {
        return {
          questionId: q.questionId?._id || q.questionId || q._id, // Keep Ref
          statement: q.statement, // Updated Text
          type: q.type,
          options: q.options, // Updated Options (including isCorrect)
          marks: q.marks,
          tabId: q.tabId,
        };
      });

      const payload = {
        title: paperTitle,
        subject: paperData.subject,
        grade: paperData.grade,
        totalMarks: paperData.selectedPattern?.totalMarks || 0,
        pattern: paperData.selectedPattern,
        questions: questionsToSave,
        examLabel: paperData.examLabel || "",
        syllabusLabel: paperData.syllabusLabel || "",
        examDate: paperData.examDate || null,
      };

      let apiUrl = `${BASE_URL}/api/papers/save`;
      let method = "post";
      if (paperData._id && paperData.title === paperTitle) {
        apiUrl = `${BASE_URL}/api/papers/${paperData._id}`;
        method = "put";
      } else if (paperData._id && paperData.title !== paperTitle) {
        const confirmNew = window.confirm("Save as NEW paper?");
        if (!confirmNew) {
          setSaving(false);
          return;
        }
      }
      const res = await axios[method](apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Paper Saved!");
        window.onbeforeunload = null;
        localStorage.removeItem("currentPaperData");
        localStorage.removeItem("paperSessionKey");
        localStorage.removeItem("isMenuOpen");
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  };

  return (
    <div
      className={`pm-container ${
        theme === "dark" ? "u-dark pw-dark" : "u-light pw-light"
      }`}
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
        onPrint={handlePrintPaper}
        isManualMode={isManualMode}
        toggleManualMode={() => setIsManualMode(!isManualMode)}
      />
      <div className="pm-workspace">
        <PaperPreview
          paperData={paperData}
          onOpenMenu={() => setIsMenuOpen(true)}
          isManualMode={isManualMode}
          onManualUpdate={handleManualUpdate}
          onManualDelete={handleManualDelete}
          onSectionDelete={handleSectionDelete}
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
      <SavePaperModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveToDatabase}
        loading={saving}
        initialTitle={paperData.title}
      />
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, id: null })}
        onConfirm={handleConfirmDelete}
        title={
          deleteModal.type === "SECTION"
            ? "Delete Entire Section?"
            : "Delete Question?"
        }
        message={
          deleteModal.type === "SECTION"
            ? "Are you sure you want to remove all questions in this section?"
            : "Are you sure you want to remove this question?"
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default PaperMaker;
