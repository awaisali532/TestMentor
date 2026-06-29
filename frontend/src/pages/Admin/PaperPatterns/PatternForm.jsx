import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useUser } from "../../../context/UserContext";
import { getCategoriesForSubject } from "../../../config/SubjectConfig";

// Components Import
import BasicConfig from "./components/BasicConfig";
import SectionBuilder from "./components/SectionBuilder";

const TYPE_LABELS = {
  MCQ: "Multiple Choice Questions",
  SHORT: "Short Questions",
  LONG: "Long Questions",
};
const selectAllOption = { label: "Select All", value: "ALL" };

const customFilterOption = (option, inputValue) => {
  const search = inputValue.toLowerCase();
  const text = option.label.toLowerCase();
  if (option.value === "ALL") return true;
  return (
    text.startsWith(`${search} -`) ||
    text.startsWith(`${search}-`) ||
    text.includes(search)
  );
};

const PatternForm = ({
  onClose,
  initialData,
  editingPattern,
  onSuccess,
  preFilledGrade,
  preFilledSubject,
  isUserMode,
  userSelectedTopics = [],
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const { user } = useUser();

  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const patternToEdit = initialData || editingPattern || null;

  const defaultState = {
    name: "",
    category: "GENERAL",
    className: preFilledGrade || "9th",
    subject: "",
    totalMarks: 12,
    timeAllowed: "2:00 Hours",
    isPairingSpecific: false,
    longQAttemptCount: 0,
    sections: [
      {
        questionNo: "Q.1",
        sectionTitle: "Multiple Choice Questions",
        questionType: "MCQ",
        questionCategory: "ANY",
        totalQuestions: 12,
        toAttempt: 12,
        marksPerQuestion: 1,
        linkedChapters: [],
        hasParts: false,
        isCompulsory: false,
        subQuestions: [],
      },
    ],
  };

  const [formData, setFormData] = useState(defaultState);

  const selectOptions = useMemo(
    () => [selectAllOption, ...chaptersList],
    [chaptersList],
  );

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--bg-body)",
      borderColor: state.isFocused ? "var(--accent-1)" : "var(--border-color)",
      color: "var(--text-main)",
      minHeight: "45px",
      borderRadius: "0.75rem",
      boxShadow: "none",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--card-bg)",
      zIndex: 99999,
      border: "1px solid var(--border-color)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--accent-1)"
        : state.isFocused
          ? "rgba(37, 99, 235, 0.1)"
          : "transparent",
      color: state.isSelected ? "white" : "var(--text-main)",
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "var(--text-main)" }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base) => ({ ...base, color: "var(--text-main)" }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#ef4444",
      cursor: "pointer",
      ":hover": { backgroundColor: "#ef4444", color: "white" },
    }),
  };

  const fetchSubjects = async (clsName) => {
    if (!clsName) return [];
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/subjects?className=${clsName}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubjectsList(res.data);
      return res.data;
    } catch (err) {
      return [];
    }
  };

  const fetchChapters = async (subjectId) => {
    if (!subjectId) {
      setChaptersList([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/chapters/subject/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const sortedData = res.data.sort(
        (a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0),
      );
      const options = sortedData.map((ch) => ({
        value: ch._id,
        label: `${ch.chapterNumber} - ${ch.name?.en || ch.name || "Untitled"}`,
      }));
      setChaptersList(options);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initializeForm = async () => {
      if (patternToEdit) {
        const subjId =
          patternToEdit.subject?._id || patternToEdit.subject || "";
        const clsName = patternToEdit.gradeLevel || preFilledGrade || "9th";
        await fetchSubjects(clsName);
        setFormData({
          name: patternToEdit.name || patternToEdit.presetName || "",
          category: patternToEdit.category || "GENERAL",
          className: clsName,
          subject: subjId,
          totalMarks: patternToEdit.totalMarks || 0,
          timeAllowed: patternToEdit.timeAllowed || "2:00 Hours",
          isPairingSpecific: patternToEdit.isPairingSpecific || false,
          longQAttemptCount: patternToEdit.longQAttemptCount || 0,
          sections:
            patternToEdit.sections?.map((sec) => ({
              ...sec,
              toAttempt: sec.toAttempt || sec.toBeAttempted || 0,
              linkedChapters: sec.linkedChapters || [],
              subQuestions: sec.subQuestions || [],
            })) || defaultState.sections,
        });
      } else {
        const initialGrade = preFilledGrade || "9th";
        const subjects = await fetchSubjects(initialGrade);
        let subjectIdToSet = "";
        if (preFilledSubject && subjects.length > 0) {
          const targetName =
            typeof preFilledSubject === "object"
              ? preFilledSubject.subjectName
              : preFilledSubject;
          const foundSubject = subjects.find(
            (s) => s.subjectName.toLowerCase() === targetName.toLowerCase(),
          );
          if (foundSubject) subjectIdToSet = foundSubject._id;
        }
        setFormData({
          ...defaultState,
          className: initialGrade,
          subject: subjectIdToSet,
        });
      }
    };
    initializeForm();
  }, [patternToEdit, preFilledGrade, preFilledSubject]);

  useEffect(() => {
    if (formData.subject) fetchChapters(formData.subject);
  }, [formData.subject]);
  useEffect(() => {
    if (formData.className && !patternToEdit && !preFilledSubject)
      fetchSubjects(formData.className);
  }, [formData.className]);

  useEffect(() => {
    const sections = formData.sections || [];
    const longSections = sections.filter((s) => s.questionType === "LONG");
    const countLong = longSections.length;

    setFormData((prev) => {
      let newCount = prev.longQAttemptCount;
      if (countLong === 0) newCount = 0;
      else if (countLong > 0 && newCount === 0) newCount = countLong;
      else if (newCount > countLong) newCount = countLong;

      const compulsoryTotal = sections.reduce((sum, sec) => {
        if (sec.questionType === "LONG") return sum;
        return (
          sum +
          (parseInt(sec.toAttempt) || 0) * (parseInt(sec.marksPerQuestion) || 0)
        );
      }, 0);

      let longTotal = 0;
      if (countLong > 0) {
        const sampleSec = longSections[0];
        let marksPerLongQ =
          sampleSec.hasParts && sampleSec.subQuestions.length > 0
            ? sampleSec.subQuestions.reduce(
                (sum, p) => sum + (parseInt(p.marks) || 0),
                0,
              )
            : parseInt(sampleSec.marksPerQuestion) || 0;
        longTotal = marksPerLongQ * newCount;
      }
      return {
        ...prev,
        longQAttemptCount: newCount,
        totalMarks: compulsoryTotal + longTotal,
      };
    });
  }, [formData.sections]);

  const handleSafeBack = () => {
    if (isDirty) {
      Swal.fire({
        title: "Unsaved Changes",
        text: "Discard changes?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#334155",
        confirmButtonText: "Discard",
        background: "#0f172a",
        color: "#ffffff",
      }).then((result) => {
        if (result.isConfirmed) onClose();
      });
    } else onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    if (name === "className")
      setFormData({
        ...formData,
        className: val,
        subject: "",
        sections: defaultState.sections,
      });
    else if (name === "longQAttemptCount") {
      const count = parseInt(val) || 0;
      const max = formData.sections.filter(
        (s) => s.questionType === "LONG",
      ).length;
      if (count <= max) setFormData({ ...formData, [name]: count });
      else toast.error(`Cannot exceed total Long Sections (${max})`);
    } else setFormData({ ...formData, [name]: val });
    setIsDirty(true);
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          questionNo: `Q.${formData.sections.length + 1}`,
          sectionTitle: "Short Questions",
          questionType: "SHORT",
          questionCategory: "ANY",
          totalQuestions: 1,
          toAttempt: 1,
          marksPerQuestion: 2,
          linkedChapters: [],
          hasParts: false,
          isCompulsory: false,
          subQuestions: [],
        },
      ],
    });
    setIsDirty(true);
  };

  const confirmRemoveSection = (index) => {
    Swal.fire({
      title: "Delete Section?",
      text: "Are you sure you want to remove this section?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Delete",
      background: "#0f172a",
      color: "#ffffff",
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData({
          ...formData,
          sections: formData.sections.filter((_, i) => i !== index),
        });
        setIsDirty(true);
      }
    });
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...formData.sections];
    let newVal = value;
    if (["totalQuestions", "toAttempt", "marksPerQuestion"].includes(field)) {
      newVal = parseInt(value) || 0;
      if (newVal < 0) newVal = 0;
    }
    if (field === "toAttempt" && newVal > updated[index].totalQuestions)
      newVal = updated[index].totalQuestions;
    if (field === "totalQuestions" && newVal < updated[index].toAttempt)
      updated[index].toAttempt = newVal;
    updated[index][field] = newVal;

    if (field === "questionType") {
      updated[index].hasParts = false;
      updated[index].subQuestions = [];
      if (TYPE_LABELS[newVal])
        updated[index].sectionTitle = TYPE_LABELS[newVal];
      if (newVal === "MCQ") {
        updated[index].toAttempt = updated[index].totalQuestions;
        updated[index].questionCategory = "MCQ_GENERAL";
        updated[index].marksPerQuestion = 1;
      } else if (newVal === "SHORT") {
        updated[index].questionCategory = "TEXT";
        updated[index].marksPerQuestion = 2;
      } else if (newVal === "LONG") {
        updated[index].marksPerQuestion = 4;
      }
    }
    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
  };

  const handleChapterSelect = (index, selectedOptions, actionMeta) => {
    const updated = [...formData.sections];
    if (
      actionMeta.action === "select-option" &&
      actionMeta.option.value === "ALL"
    )
      updated[index].linkedChapters = chaptersList.map((ch) => ch.value);
    else if (
      actionMeta.action === "deselect-option" &&
      actionMeta.option.value === "ALL"
    )
      updated[index].linkedChapters = [];
    else
      updated[index].linkedChapters = selectedOptions
        ? selectedOptions.map((opt) => opt.value).filter((val) => val !== "ALL")
        : [];
    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
  };

  const addSubQuestion = (secIndex) => {
    const updated = [...formData.sections];
    updated[secIndex].subQuestions.push({
      label: `(${String.fromCharCode(97 + updated[secIndex].subQuestions.length)})`,
      questionCategory: "THEORY",
      marks: 4,
      linkedChapters: [],
    });
    setFormData({ ...formData, sections: updated });
  };

  const handlePartChange = (secIndex, partIndex, field, value) => {
    const updated = [...formData.sections];
    updated[secIndex].subQuestions[partIndex][field] = value;
    setFormData({ ...formData, sections: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Pattern Name is required");
    if (!formData.subject) return toast.error("Please select a Subject");

    setLoading(true);
    try {
      const payload = {
        ...formData,
        gradeLevel: formData.className,
        isSystemPreset: !isUserMode,
        createdBy: user?._id,
      };
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = patternToEdit
        ? await axios.put(
            `${BASE_URL}/api/patterns/${patternToEdit._id}`,
            payload,
            config,
          )
        : await axios.post(`${BASE_URL}/api/patterns`, payload, config);

      toast.success(
        isUserMode ? "Custom Pattern Saved!" : "System Pattern Created!",
      );
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation Failed");
    } finally {
      setLoading(false);
    }
  };

  const currentSubjectName =
    subjectsList.find((s) => s._id === formData.subject)?.subjectName || "";
  const currentCategories = getCategoriesForSubject(currentSubjectName);
  const longSectionsCount = formData.sections.filter(
    (s) => s.questionType === "LONG",
  ).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
        {!isUserMode && (
          <button
            onClick={handleSafeBack}
            className="p-2 bg-pill-bg text-muted hover:text-main rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
        )}
        <h3 className="text-2xl font-extrabold text-main m-0">
          {patternToEdit ? "Edit Pattern" : "Create Custom Pattern"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicConfig
          formData={formData}
          handleChange={handleChange}
          preFilledGrade={preFilledGrade}
          isUserMode={isUserMode}
          subjectsList={subjectsList}
          preFilledSubject={preFilledSubject}
          longSectionsCount={longSectionsCount}
        />

        <SectionBuilder
          formData={formData}
          handleSectionChange={handleSectionChange}
          confirmRemoveSection={confirmRemoveSection}
          currentCategories={currentCategories}
          chaptersList={chaptersList}
          selectOptions={selectOptions}
          customFilterOption={customFilterOption}
          customStyles={customStyles}
          handleChapterSelect={handleChapterSelect}
          handlePartChange={handlePartChange}
          addSubQuestion={addSubQuestion}
          addSection={addSection}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
          <button
            type="button"
            onClick={handleSafeBack}
            className="px-6 py-2.5 rounded-xl font-bold bg-pill-bg text-muted hover:text-main transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold bg-accent-1 text-white hover:bg-accent-2 transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-accent-1/30"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <FaSave /> Save Pattern
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatternForm;
