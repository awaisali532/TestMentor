import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { showConfirmAlert } from "../../../utils/AlertHelper";

// Components
import PaperLayout from "./components/PaperLayout";
import PaperPreview from "./components/PaperPreview/PaperPreview";
import QuestionMenu from "./components/QuestionMenu/QuestionMenu";
import SavePaperModal from "./components/SavePaperModal";
import PatternForm from "../../Admin/PaperPatterns/PatternForm";

const PaperMaker = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const location = useLocation();
  const navigate = useNavigate();
  const isExiting = useRef(false);

  const [paperData, setPaperData] = useState(() => {
    if (location.state) return location.state;
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

  // ====================================================================
  // ✅ MAGIC TRICK: FORCED DESKTOP VIEW ON MOBILE (PINCH-TO-ZOOM)
  // ====================================================================
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    let originalViewport = "width=device-width, initial-scale=1.0";

    if (viewportMeta) {
      originalViewport = viewportMeta.getAttribute("content");
      // Browser ko force kar do ke wo 1280px ki desktop screen ban jaye
      viewportMeta.setAttribute("content", "width=1280, user-scalable=yes");
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=1280, user-scalable=yes";
      document.head.appendChild(meta);
    }

    return () => {
      // Jab user Dashboard par wapas jaye toh wapas mobile mode on kar do
      const viewportToRestore = document.querySelector('meta[name="viewport"]');
      if (viewportToRestore) {
        viewportToRestore.setAttribute("content", originalViewport);
      }
    };
  }, []);
  // ====================================================================

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

  // ✅ Completion Logic
  const checkPaperCompletion = useCallback(() => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    const sections = pattern?.sections || [];

    if (!sections || sections.length === 0) return false;

    let isComplete = true;
    const questions = paperData?.questions || [];

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const type = String(sec.questionType || "")
        .toUpperCase()
        .trim();
      let limit = parseInt(
        sec.totalQuestions || sec.quantity || sec.toAttempt || 0,
      );

      if (type === "LONG" && sec.hasParts) limit *= 2;

      let currentCount = 0;

      if (type === "MCQ") {
        currentCount = questions.filter(
          (q) =>
            String(q.type || "")
              .toUpperCase()
              .trim() === "MCQ",
        ).length;
      } else if (type === "SHORT") {
        currentCount = questions.filter(
          (q) =>
            String(q.tabId) === `sec_${i}` || String(q.tabId) === String(i),
        ).length;
      } else if (type === "LONG") {
        currentCount = questions.filter((q) =>
          String(q.tabId).startsWith(`long_${i}`),
        ).length;
      }

      if (currentCount < limit) {
        isComplete = false;
      }
    }

    return isComplete;
  }, [paperData]);

  const isPaperComplete = checkPaperCompletion();

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
    if (!incomingData) {
      setShowPatternEdit(false);
      return;
    }

    let updatedPattern = incomingData;
    if (incomingData.pattern) updatedPattern = incomingData.pattern;
    else if (incomingData.data && incomingData.data.sections)
      updatedPattern = incomingData.data;

    if (!updatedPattern || !updatedPattern.sections) {
      toast.error("Failed to parse the updated pattern structure.");
      setShowPatternEdit(false);
      return;
    }

    setPaperData((prev) => {
      const oldPattern = prev.selectedPattern;
      let currentQuestions = [...(prev.questions || [])];

      if (oldPattern && oldPattern.sections) {
        updatedPattern.sections.forEach((newSec, index) => {
          const oldSec = oldPattern.sections[index];
          if (oldSec) {
            const oldLimit = parseInt(
              oldSec.totalQuestions || oldSec.quantity || oldSec.toAttempt || 0,
            );
            const newLimit = parseInt(
              newSec.totalQuestions || newSec.quantity || newSec.toAttempt || 0,
            );

            let isCategoryChanged =
              (oldSec.questionCategory || "ANY") !==
              (newSec.questionCategory || "ANY");

            if (String(newSec.questionType).toUpperCase() === "LONG") {
              if (oldSec.hasParts !== newSec.hasParts) {
                isCategoryChanged = true;
              } else if (newSec.hasParts) {
                const oldSubs = (oldSec.subQuestions || [])
                  .map((s) => s.questionCategory || "ANY")
                  .join(",");
                const newSubs = (newSec.subQuestions || [])
                  .map((s) => s.questionCategory || "ANY")
                  .join(",");
                if (oldSubs !== newSubs) isCategoryChanged = true;
              }
            }

            if (oldLimit !== newLimit || isCategoryChanged) {
              const type = String(newSec.questionType).toUpperCase();
              if (type === "MCQ") {
                currentQuestions = currentQuestions.filter(
                  (q) => String(q.type).toUpperCase() !== "MCQ",
                );
              } else if (type === "SHORT") {
                const secId = `sec_${index}`;
                const altId = String(index);
                currentQuestions = currentQuestions.filter(
                  (q) => q.tabId !== secId && String(q.tabId) !== altId,
                );
              } else if (type === "LONG") {
                currentQuestions = currentQuestions.filter(
                  (q) => !String(q.tabId).startsWith(`long_${index}`),
                );
              }
            }
          }
        });
      }

      return {
        ...prev,
        selectedPattern: updatedPattern,
        questions: currentQuestions,
      };
    });

    setShowPatternEdit(false);
  }, []);

  const handleAddQuestionsToPaper = useCallback(
    (incomingQuestions, typeToUpdate) => {
      if (typeToUpdate === "REPLACE_ALL") {
        setPaperData((prev) => ({ ...prev, questions: incomingQuestions }));
        toast.success("Questions added to paper!");
        return;
      }
      setPaperData((prev) => {
        const keepQuestions = (prev.questions || []).filter(
          (q) => q.type !== typeToUpdate,
        );
        return { ...prev, questions: [...keepQuestions, ...incomingQuestions] };
      });
      if (incomingQuestions.length > 0)
        toast.success(`Questions Added Successfully!`);
      else toast(`Selection Cleared!`, { icon: "🗑️" });
    },
    [],
  );

  const triggerDeleteAlert = async (type, id, extra = null) => {
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
    if (!isPaperComplete) {
      return toast.error("Please complete your paper first before saving!");
    }
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (formData) => {
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

      const updatedPattern = {
        ...paperData.selectedPattern,
        timeAllowed: formData.timeAllowed,
      };

      const payload = {
        title: formData.title,
        examLabel: formData.category,
        examDate: formData.examDate,
        subject: paperData.subject?._id || paperData.subject,
        grade: paperData.grade,
        totalMarks: formData.totalMarks,
        pattern: updatedPattern,
        questions: questionsToSave,
      };

      const isPut = paperData._id && paperData.title !== "Untitled Paper";
      const endpoint = isPut ? `${paperData._id}` : "save";

      const res = await axios[isPut ? "put" : "post"](
        `${BASE_URL}/api/papers/${endpoint}`,
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
        isPaperComplete={isPaperComplete}
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
        paperData={paperData}
      />
    </>
  );
};

export default PaperMaker;
