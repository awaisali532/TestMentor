import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import toast, { Toaster } from "react-hot-toast";

// Components
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

  // ✅ Exit Tracking
  const isExiting = useRef(false);

  // --- SESSION STATE (FIXED) ---
  const [sessionState, setSessionState] = useState(() => {
    // 🔥 FIX 1: Always prioritize location.state (New Paper) over localStorage
    if (location.state) {
      return { data: location.state, menuOpen: true };
    }

    const savedData = localStorage.getItem("currentPaperData");
    const savedMenu = localStorage.getItem("isMenuOpen");

    if (savedData) {
      try {
        return {
          data: JSON.parse(savedData),
          menuOpen: savedMenu ? JSON.parse(savedMenu) : false,
        };
      } catch (e) {
        console.error("Error parsing data", e);
      }
    }
    return { data: null, menuOpen: true };
  });

  const [paperData, setPaperData] = useState(sessionState.data);
  const [isMenuOpen, setIsMenuOpen] = useState(sessionState.menuOpen);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPatternEdit, setShowPatternEdit] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    extra: null,
  });

  // --- EFFECTS ---
  useEffect(() => {
    if (!paperData) {
      navigate("/user/generate-paper");
    }
  }, [paperData, navigate]);

  useEffect(() => {
    if (location.state) {
      localStorage.setItem("currentPaperData", JSON.stringify(location.state));
    }
  }, []);

  useEffect(() => {
    if (paperData)
      localStorage.setItem("currentPaperData", JSON.stringify(paperData));
  }, [paperData]);

  useEffect(() => {
    localStorage.setItem("isMenuOpen", JSON.stringify(isMenuOpen));
  }, [isMenuOpen]);

  // ✅ AUTO-HEAL ON LOAD
  useEffect(() => {
    if (!paperData?.selectedPattern?.sections || !paperData?.questions) return;
    const sections = paperData.selectedPattern.sections;

    const shortIndices = sections
      .map((s, i) => (s.questionType === "SHORT" ? i : -1))
      .filter((i) => i !== -1);
    const longIndices = sections
      .map((s, i) => (s.questionType === "LONG" ? i : -1))
      .filter((i) => i !== -1);

    let hasChanges = false;
    const healedQuestions = paperData.questions.map((q) => {
      if (q.type === "MCQ") return q;

      let currentIdx = -1;
      let needsFix = false;

      if (q.tabId && q.tabId.startsWith("sec_"))
        currentIdx = parseInt(q.tabId.replace("sec_", ""));
      else if (q.tabId && q.tabId.startsWith("long_"))
        currentIdx = parseInt(q.tabId.split("_")[1]);
      else needsFix = true;

      if (q.type === "SHORT" && !shortIndices.includes(currentIdx))
        needsFix = true;
      if (q.type === "LONG" && !longIndices.includes(currentIdx))
        needsFix = true;

      if (needsFix) {
        hasChanges = true;
        if (q.type === "SHORT" && shortIndices.length > 0)
          return { ...q, tabId: `sec_${shortIndices[0]}` };
        if (q.type === "LONG" && longIndices.length > 0)
          return { ...q, tabId: `long_${longIndices[0]}_full` };
      }
      return q;
    });

    if (hasChanges)
      setPaperData((prev) => ({ ...prev, questions: healedQuestions }));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isExiting.current) return;
      if (paperData) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [paperData]);

  if (!paperData) return null;

  // --- HANDLERS ---
  const handleCancelPaper = () => {
    window.onbeforeunload = null;
    localStorage.removeItem("currentPaperData");
    localStorage.removeItem("paperSessionKey");
    localStorage.removeItem("isMenuOpen");
    navigate("/user/dashboard");
  };

  // ✅ MEMOIZED HANDLERS
  const handlePatternUpdate = useCallback((incomingData) => {
    if (!incomingData) {
      setShowPatternEdit(false);
      return;
    }
    const updatedPattern = incomingData.data || incomingData;
    if (!updatedPattern || !updatedPattern.sections) {
      toast.error("Failed to update pattern structure.");
      return;
    }

    setPaperData((prevData) => {
      const oldSections = prevData.selectedPattern?.sections || [];
      const newSections = updatedPattern.sections || [];

      const indexMap = {};
      const usedNewIndices = new Set();

      const toNum = (val) => (val ? parseInt(val) : 0);
      const getMarks = (sec) => toNum(sec.marks || sec.marksPerQuestion);
      const getQty = (sec) => toNum(sec.quantity || sec.totalQuestions);

      // --- MATCHING STRATEGY ---
      oldSections.forEach((oldSec, oldIdx) => {
        let matchIdx = -1;

        matchIdx = newSections.findIndex((newSec, newIdx) => {
          if (usedNewIndices.has(newIdx)) return false;
          return (
            newSec.questionType === oldSec.questionType &&
            getMarks(newSec) === getMarks(oldSec) &&
            getQty(newSec) === getQty(oldSec)
          );
        });

        if (matchIdx === -1) {
          matchIdx = newSections.findIndex((newSec, newIdx) => {
            if (usedNewIndices.has(newIdx)) return false;
            return (
              newSec.questionType === oldSec.questionType &&
              getQty(newSec) === getQty(oldSec)
            );
          });
        }

        if (matchIdx === -1) {
          matchIdx = newSections.findIndex((newSec, newIdx) => {
            if (usedNewIndices.has(newIdx)) return false;
            return (
              newSec.questionType === oldSec.questionType &&
              getMarks(newSec) === getMarks(oldSec)
            );
          });
        }

        if (matchIdx === -1) {
          matchIdx = newSections.findIndex((newSec, newIdx) => {
            if (usedNewIndices.has(newIdx)) return false;
            return newSec.questionType === oldSec.questionType;
          });
        }

        if (matchIdx !== -1) {
          const newSec = newSections[matchIdx];

          const oldParts = !!oldSec.hasParts;
          const newParts = !!newSec.hasParts;
          const isPartsChanged =
            oldSec.questionType === "LONG" && oldParts !== newParts;

          if (isPartsChanged) {
            usedNewIndices.add(matchIdx);
          } else {
            indexMap[oldIdx] = matchIdx;
            usedNewIndices.add(matchIdx);
          }
        }
      });

      const updatedQuestions = prevData.questions
        .map((q) => {
          if (q.type === "MCQ") return q;
          if (!q.tabId) return q;

          let oldIdx = -1;

          if (q.tabId.startsWith("sec_")) {
            oldIdx = parseInt(q.tabId.replace("sec_", ""));
          } else if (q.tabId.startsWith("long_")) {
            const parts = q.tabId.split("_");
            if (parts.length >= 2) {
              oldIdx = parseInt(parts[1]);
            }
          }

          if (oldIdx !== -1 && indexMap[oldIdx] !== undefined) {
            const newIdx = indexMap[oldIdx];
            const oldSec = oldSections[oldIdx];
            const newSec = newSections[newIdx];

            // CASE A: LONG QUESTIONS WITH PARTS
            if (q.type === "LONG" && newSec.hasParts) {
              const idParts = q.tabId.split("_");
              const suffix = idParts[3];

              if (suffix === "a" || suffix === "b") {
                const subIndex = suffix === "a" ? 0 : 1;
                const oldSubCat =
                  oldSec.subQuestions?.[subIndex]?.questionCategory;
                const newSubCat =
                  newSec.subQuestions?.[subIndex]?.questionCategory;

                if (oldSubCat && newSubCat && oldSubCat !== newSubCat) {
                  return null;
                }
              }
            }
            // CASE B: FULL QUESTIONS
            else {
              const oldCat = oldSec.questionCategory;
              const newCat = newSec.questionCategory;

              if (oldCat && newCat && oldCat !== newCat) {
                return null;
              }
            }

            if (newIdx !== oldIdx) {
              if (q.type === "SHORT") {
                return { ...q, tabId: `sec_${newIdx}` };
              }
              if (q.type === "LONG") {
                const parts = q.tabId.split("_");
                if (parts.length >= 2) {
                  parts[1] = newIdx;
                  return { ...q, tabId: parts.join("_") };
                }
              }
            }
            return q;
          }
          return null;
        })
        .filter(Boolean);

      const newTotalMarks =
        updatedPattern.totalMarks ||
        newSections.reduce((sum, sec) => {
          const qMarks = getMarks(sec);
          const qQty = getQty(sec);
          return sum + qMarks * qQty;
        }, 0);

      return {
        ...prevData,
        selectedPattern: updatedPattern,
        questions: updatedQuestions,
        totalMarks: newTotalMarks,
      };
    });

    setShowPatternEdit(false);
    toast.success("Pattern Updated Successfully!");
  }, []);

  const handleAddQuestionsToPaper = useCallback(
    (incomingQuestions, typeToUpdate) => {
      if (typeToUpdate === "REPLACE_ALL") {
        setPaperData((prevData) => ({
          ...prevData,
          questions: incomingQuestions,
        }));
        toast.success("Paper Updated Successfully!");
        return;
      }
      setPaperData((prevData) => {
        const existingQuestions = prevData.questions || [];
        const keepQuestions = existingQuestions.filter(
          (q) => q.type !== typeToUpdate,
        );
        return {
          ...prevData,
          questions: [...keepQuestions, ...incomingQuestions],
        };
      });
      if (incomingQuestions.length > 0)
        toast.success(`${typeToUpdate} Added Successfully!`);
      else toast(`${typeToUpdate} Cleared!`, { icon: "🗑️" });
    },
    [],
  );

  const handlePrintPaper = (mode = "SINGLE") => {
    navigate("/user/print-paper", {
      state: { ...paperData, printSettings: { mode: mode } },
    });
  };

  const handleManualDelete = (qId) =>
    setDeleteModal({ isOpen: true, type: "SINGLE", id: qId, extra: null });
  const handleSectionDelete = (type, tabIdPrefix = null) =>
    setDeleteModal({
      isOpen: true,
      type: "SECTION",
      id: type,
      extra: tabIdPrefix,
    });

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
          if (field === "statement") {
            return { ...q, statement: { ...q.statement, [lang]: value } };
          }
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSaveClick = () => {
    if (!paperData.questions || paperData.questions.length === 0) {
      toast.error("Paper is empty!");
      return;
    }
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (paperTitle) => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
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
        examLabel: paperData.examLabel || "",
        syllabusLabel: paperData.syllabusLabel || "",
        examDate: paperData.examDate || null,
      };

      let apiUrl = `${BASE_URL}/api/papers/save`;
      let method = "post";
      if (paperData._id && paperData.title === paperTitle) {
        apiUrl = `${BASE_URL}/api/papers/update/${paperData._id}`;
        method = "put";
      }

      const res = await axios[method](apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(method === "put" ? "Paper Updated!" : "Paper Saved!");
        isExiting.current = true;
        localStorage.removeItem("currentPaperData");
        localStorage.removeItem("paperSessionKey");
        localStorage.removeItem("isMenuOpen");
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save paper");
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  };

  return (
    <div
      className={`pm-container ${theme === "dark" ? "u-dark pw-dark" : "u-light pw-light"}`}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <MakerSidebar
        paperData={paperData}
        onOpenMenu={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCancel={handleCancelPaper}
        onSave={handleSaveClick}
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
        onConfirm={handleConfirmSave}
        isSaving={saving}
        defaultTitle={
          paperData.title === "Untitled Paper" ? "" : paperData.title
        }
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
