import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { showConfirmAlert } from "../../../utils/AlertHelper"; // ✅ Clean Alert Helper

// Components
import PaperLayout from "./components/PaperLayout"; // ✅ Clean Wrapper
import PaperPreview from "./components/PaperPreview/PaperPreview";
import QuestionMenu from "./components/QuestionMenu/QuestionMenu";
import SavePaperModal from "./components/SavePaperModal";
import PatternForm from "../../Admin/PaperPatterns/PatternForm";
import {
  healPaperQuestions,
  syncPatternUpdate,
} from "../../../utils/paperHelpers";

const PaperMaker = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const location = useLocation();
  const navigate = useNavigate();
  const isExiting = useRef(false);

  const [paperData, setPaperData] = useState(() => {
    if (location.state) return healPaperQuestions(location.state);
    const savedData = localStorage.getItem("tm_paper_draft");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Parse error", e);
      }
    }
    return null;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(
    () => localStorage.getItem("tm_menu_state") === "true",
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPatternEdit, setShowPatternEdit] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    if (!paperData) navigate("/user/generate-paper");
    else localStorage.setItem("tm_paper_draft", JSON.stringify(paperData));
  }, [paperData, navigate]);

  useEffect(() => {
    localStorage.setItem("tm_menu_state", isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isExiting.current && paperData) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [paperData]);

  if (!paperData) return null;

  const handleCancelPaper = () => {
    window.onbeforeunload = null;
    localStorage.removeItem("tm_paper_draft");
    localStorage.removeItem("tm_menu_state");
    navigate("/user/dashboard");
  };

  const handlePrintPaper = (mode = "SINGLE") => {
    const printPayload = { ...paperData, printSettings: { mode } };
    localStorage.setItem("tm_print_data", JSON.stringify(printPayload));
    window.open("/user/print-paper", "_blank");
  };

  const handlePatternUpdate = useCallback((incomingData) => {
    if (!incomingData) return setShowPatternEdit(false);
    const updatedPattern = incomingData.data || incomingData;
    if (!updatedPattern || !updatedPattern.sections)
      return toast.error("Failed to update pattern structure.");
    setPaperData((prev) => syncPatternUpdate(prev, updatedPattern));
    setShowPatternEdit(false);
    toast.success("Pattern Updated Successfully!");
  }, []);

  const handleAddQuestionsToPaper = useCallback(
    (incomingQuestions, typeToUpdate) => {
      if (typeToUpdate === "REPLACE_ALL") {
        setPaperData((prev) => ({ ...prev, questions: incomingQuestions }));
        toast.success("Paper Updated Successfully!");
        return;
      }
      setPaperData((prev) => {
        const keepQuestions = (prev.questions || []).filter(
          (q) => q.type !== typeToUpdate,
        );
        return { ...prev, questions: [...keepQuestions, ...incomingQuestions] };
      });
      if (incomingQuestions.length > 0)
        toast.success(`${typeToUpdate} Added Successfully!`);
      else toast(`${typeToUpdate} Cleared!`, { icon: "🗑️" });
    },
    [],
  );

  const triggerDeleteAlert = async (type, id, extra = null) => {
    // ✅ Massive Swal.fire CSS is GONE. Using clean helper.
    const result = await showConfirmAlert({
      title: type === "SECTION" ? "Delete Entire Section?" : "Delete Question?",
      text:
        type === "SECTION"
          ? "Are you sure you want to remove all questions in this section?"
          : "Are you sure you want to remove this question?",
      confirmButtonText: "Yes, Delete",
    });

    if (result.isConfirmed) {
      setPaperData((prev) => {
        if (type === "SINGLE")
          return {
            ...prev,
            questions: prev.questions.filter(
              (q) =>
                (q.questionId?._id || q.questionId || q._id) !== id &&
                q._id !== id,
            ),
          };
        if (type === "SECTION")
          return {
            ...prev,
            questions: prev.questions.filter((q) => {
              if (id === "MCQ" && q.type === "MCQ") return false;
              if (id === "LONG" && q.type === "LONG") return false;
              if (id === "SHORT" && q.type === "SHORT")
                return extra ? !q.tabId?.startsWith(extra) : false;
              return true;
            }),
          };
        return prev;
      });
      toast.success("Deleted successfully");
    }
  };

  const handleManualDelete = (qId) => triggerDeleteAlert("SINGLE", qId);
  const handleSectionDelete = (type, tabIdPrefix = null) =>
    triggerDeleteAlert("SECTION", type, tabIdPrefix);

  const handleManualUpdate = (qId, field, lang, value, optIndex = null) => {
    setPaperData((prev) => {
      const updatedQuestions = prev.questions.map((q) => {
        const id = q.questionId?._id || q.questionId || q._id;
        if (id === qId || q._id === qId) {
          if (field === "options" && optIndex !== null) {
            const newOpts = [...q.options];
            newOpts[optIndex] = { ...newOpts[optIndex], [lang]: value };
            return { ...q, options: newOpts };
          }
          if (field === "statement")
            return { ...q, statement: { ...q.statement, [lang]: value } };
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSaveClick = () => {
    if (!paperData.questions || paperData.questions.length === 0)
      return toast.error("Paper is empty!");
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (paperTitle) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const questionsToSave = paperData.questions.map((q) => ({
        questionId: q.questionId?._id || q.questionId || q._id,
        statement: q.statement,
        type: q.type,
        options: q.options,
        marks: q.marks,
        tabId: q.tabId,
      }));

      const payload = {
        title: paperTitle,
        subject: paperData.subject?._id || paperData.subject,
        grade: paperData.grade,
        totalMarks: paperData.selectedPattern?.totalMarks || 0,
        pattern: paperData.selectedPattern,
        questions: questionsToSave,
      };

      const isPut = paperData._id && paperData.title === paperTitle;
      const res = await axios[isPut ? "put" : "post"](
        `${BASE_URL}/api/papers/${isPut ? `update/${paperData._id}` : "save"}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        toast.success(isPut ? "Paper Updated!" : "Paper Saved!");
        isExiting.current = true;
        localStorage.removeItem("tm_paper_draft");
        localStorage.removeItem("tm_menu_state");
        navigate("/user/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save paper");
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  };

  return (
    <>
      {/* ✅ The UI is now clean! All layout structure is inside PaperLayout */}
      <PaperLayout
        paperData={paperData}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMenuOpen={isMenuOpen}
        onOpenMenu={() => setIsMenuOpen(true)}
        onCancel={handleCancelPaper}
        onSave={handleSaveClick}
        onPrint={handlePrintPaper}
        isManualMode={isManualMode}
        toggleManualMode={() => setIsManualMode(!isManualMode)}
      >
        <PaperPreview
          paperData={paperData}
          onOpenMenu={() => setIsMenuOpen(true)}
          isManualMode={isManualMode}
          onManualUpdate={handleManualUpdate}
          onManualDelete={handleManualDelete}
          onSectionDelete={handleSectionDelete}
        />
      </PaperLayout>

      {/* Modals & Popups remain outside the layout flow naturally */}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-2000 p-4">
          <div className="bg-card w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative custom-scrollbar">
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
        onConfirm={handleConfirmSave}
        loading={saving}
        initialTitle={
          paperData.title === "Untitled Paper" ? "" : paperData.title
        }
      />
    </>
  );
};

export default PaperMaker;
