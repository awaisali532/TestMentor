import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaLayerGroup,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useUI } from "../../../context/UIContext";
import { useUser } from "../../../context/UserContext";
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";
import TMLoader from "../../../components/common/TMLoader/TMLoader";
import { getCategoriesForSubject } from "../../../config/SubjectConfig";
import Select from "react-select";
import "./PaperPatterns.css";

const PATTERN_CATEGORIES = [
  { value: "GENERAL", label: "General / Mixed" },
  { value: "FULL_BOOK", label: "Full Book (Board Pattern)" },
  { value: "HALF_BOOK", label: "Half Book" },
  { value: "CHAPTER_WISE", label: "Chapter Wise (Short Test)" },
];

const selectAllOption = { label: "Select All", value: "ALL" };

const customFilterOption = (option, inputValue) => {
  const { label, value } = option;
  const search = inputValue.toLowerCase();
  const text = label.toLowerCase();
  if (value === "ALL") return true;
  return (
    text.startsWith(`${search} -`) ||
    text.startsWith(`${search}-`) ||
    text.includes(search)
  );
};

const TYPE_LABELS = {
  MCQ: "Multiple Choice Questions",
  SHORT: "Short Questions",
  LONG: "Long Questions",
  THEORY: "Theory Section",
  COMPULSORY: "Compulsory Section",
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
  const { setIsEditing } = useUI();
  const { user } = useUser();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

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

  const selectOptions = useMemo(() => {
    return [selectAllOption, ...chaptersList];
  }, [chaptersList]);

  // STYLES
  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--bg-body)",
      borderColor: state.isFocused ? "var(--accent-1)" : "var(--border-color)",
      color: "var(--text-main)",
      minHeight: "45px",
      borderRadius: "10px",
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
      ":active": { backgroundColor: "var(--accent-1)", color: "white" },
    }),
    singleValue: (base) => ({ ...base, color: "var(--text-main)" }),
    input: (base) => ({ ...base, color: "var(--text-main)" }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      borderRadius: "5px",
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
      setSubjectsList([]);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/subjects?className=${clsName}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubjectsList(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to load subjects", err);
      return [];
    }
  };

  useEffect(() => {
    if (formData.className && !patternToEdit && !preFilledSubject) {
      fetchSubjects(formData.className);
    }
  }, [formData.className]);

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

      let rawData = res.data;
      const hasTopicsData = rawData.some(
        (ch) => ch.topics && ch.topics.length > 0,
      );

      if (
        isUserMode &&
        hasTopicsData &&
        userSelectedTopics &&
        userSelectedTopics.length > 0
      ) {
        const safeUserTopics = userSelectedTopics.map((id) => String(id));
        rawData = rawData.filter((chapter) => {
          if (!chapter.topics) return false;
          return chapter.topics.some((t) => {
            const tId = typeof t === "object" ? String(t._id) : String(t);
            return safeUserTopics.includes(tId);
          });
        });
      } else if (isUserMode && !hasTopicsData) {
        console.warn(
          "Backend did not return topics inside chapters. Showing ALL chapters as fallback.",
        );
      }

      const sortedData = rawData.sort(
        (a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0),
      );

      const options = sortedData.map((ch) => {
        let displayName = "Untitled";
        if (ch.name) {
          if (typeof ch.name === "object" && ch.name.en)
            displayName = ch.name.en;
          else if (typeof ch.name === "string") displayName = ch.name;
        }
        return { value: ch._id, label: `${ch.chapterNumber} - ${displayName}` };
      });

      setChaptersList(options);
    } catch (err) {
      console.error("Failed to load chapters", err);
    }
  };

  useEffect(() => {
    if (formData.subject) {
      fetchChapters(formData.subject);
    }
  }, [formData.subject, userSelectedTopics]);

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

  // ==========================================================
  // 🔥 FIX: AUTO-CALCULATE & FORCE RESET LOGIC
  // ==========================================================
  useEffect(() => {
    const sections = formData.sections || [];

    // 1. Calculate Count of Long Sections
    const longSections = sections.filter((s) => s.questionType === "LONG");
    const countLong = longSections.length;

    setFormData((prev) => {
      let newCount = prev.longQAttemptCount;

      // ✅ FIX: Agar Long Sections 0 hain, to count ko zabardasti 0 kar do
      if (countLong === 0) {
        newCount = 0;
      }
      // Agar sections barh gaye aur count 0 tha, to default set kar do
      else if (countLong > 0 && newCount === 0) {
        newCount = countLong;
      }
      // Agar current count available sections se zyada hai, to limit kar do
      else if (newCount > countLong) {
        newCount = countLong;
      }

      // 2. Calculate Total Marks
      const compulsoryTotal = sections.reduce((sum, sec) => {
        if (sec.questionType === "LONG") return sum;
        const attempt = parseInt(sec.toAttempt) || 0;
        const marks = parseInt(sec.marksPerQuestion) || 0;
        return sum + attempt * marks;
      }, 0);

      let longTotal = 0;
      if (countLong > 0) {
        // Assume marks from first long section for calculation (standard pattern)
        const sampleSec = longSections[0];
        let marksPerLongQ = 0;
        if (sampleSec.hasParts && sampleSec.subQuestions.length > 0) {
          marksPerLongQ = sampleSec.subQuestions.reduce(
            (sum, p) => sum + (parseInt(p.marks) || 0),
            0,
          );
        } else {
          marksPerLongQ = parseInt(sampleSec.marksPerQuestion) || 0;
        }
        longTotal = marksPerLongQ * newCount;
      }

      return {
        ...prev,
        longQAttemptCount: newCount, // ✅ Updated Correct Count
        totalMarks: compulsoryTotal + longTotal,
      };
    });
  }, [formData.sections]); // Only depend on sections to avoid loops

  const handleSafeBack = () => {
    if (isUserMode) {
      isDirty ? setShowExitConfirm(true) : onClose();
    } else {
      isDirty ? setShowExitConfirm(true) : onClose();
    }
  };

  const handleCleanupAndClose = () => {
    setIsEditing(false);
    if (isUserMode && onSuccess) onSuccess(null);
    else if (onClose) onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    if (name === "className") {
      setFormData({
        ...formData,
        className: val,
        subject: "",
        sections: defaultState.sections,
      });
    } else if (name === "subject") {
      setFormData({ ...formData, subject: val });
    } else if (name === "longQAttemptCount") {
      const count = parseInt(val) || 0;
      const max = formData.sections.filter(
        (s) => s.questionType === "LONG",
      ).length;
      if (count <= max) {
        setFormData({ ...formData, [name]: count });
      } else {
        toast.error(`Cannot exceed total Long Sections (${max})`);
      }
    } else {
      setFormData({ ...formData, [name]: val });
    }
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

  const initiateRemoveSection = (index) => {
    setSectionToDelete(index);
  };

  const confirmRemoveSection = () => {
    if (sectionToDelete === null) return;
    const updated = formData.sections.filter((_, i) => i !== sectionToDelete);
    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
    setSectionToDelete(null);
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...formData.sections];
    let newVal = value;
    if (["totalQuestions", "toAttempt", "marksPerQuestion"].includes(field)) {
      newVal = parseInt(value) || 0;
      if (newVal < 0) newVal = 0;
    }
    if (field === "toAttempt") {
      const total = updated[index].totalQuestions;
      if (newVal > total) newVal = total;
    }
    if (field === "totalQuestions") {
      const attempt = updated[index].toAttempt;
      if (newVal < attempt) updated[index].toAttempt = newVal;
    }

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
    if (updated[index].questionType === "MCQ" && field === "totalQuestions") {
      updated[index].toAttempt = newVal;
    }
    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
  };

  const handleChapterSelect = (index, selectedOptions, actionMeta) => {
    const updated = [...formData.sections];
    if (
      actionMeta.action === "select-option" &&
      actionMeta.option.value === "ALL"
    ) {
      updated[index].linkedChapters = chaptersList.map((ch) => ch.value);
    } else if (
      actionMeta.action === "deselect-option" &&
      actionMeta.option.value === "ALL"
    ) {
      updated[index].linkedChapters = [];
    } else {
      updated[index].linkedChapters = selectedOptions
        ? selectedOptions.map((opt) => opt.value).filter((val) => val !== "ALL")
        : [];
    }
    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
  };

  const addSubQuestion = (secIndex) => {
    const updated = [...formData.sections];
    const parts = updated[secIndex].subQuestions;
    const nextLabel = String.fromCharCode(97 + parts.length);
    parts.push({
      label: `(${nextLabel})`,
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

    // Count actual long sections before saving
    const actualLongSectionsCount = formData.sections.filter(
      (s) => s.questionType === "LONG",
    ).length;

    for (let i = 0; i < formData.sections.length; i++) {
      const sec = formData.sections[i];
      if (sec.toAttempt < 1)
        return toast.error(
          `${sec.questionNo}: Questions to Attempt must be at least 1`,
        );
      if (sec.questionType === "SHORT" && sec.marksPerQuestion < 2)
        return toast.error(
          `${sec.questionNo}: Short Question marks cannot be less than 2`,
        );
      if (
        sec.questionType === "LONG" &&
        !sec.hasParts &&
        sec.marksPerQuestion < 4
      )
        return toast.error(
          `${sec.questionNo}: Long Question marks cannot be less than 4`,
        );
    }

    setLoading(true);

    const payload = {
      ...formData,
      // ✅ SAFETY NET: If no long sections, force count to 0 in DB
      longQAttemptCount:
        actualLongSectionsCount === 0 ? 0 : formData.longQAttemptCount,
      gradeLevel: formData.className,
      isSystemPreset: isUserMode ? false : true,
      createdBy: user?._id,
    };

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let savedData;

      if (patternToEdit && patternToEdit._id) {
        // UPDATE
        const res = await axios.put(
          `${BASE_URL}/api/patterns/${patternToEdit._id}`,
          payload,
          config,
        );
        savedData = res.data;
        toast.success("Pattern Updated!");
      } else {
        // CREATE
        const res = await axios.post(
          `${BASE_URL}/api/patterns`,
          payload,
          config,
        );
        savedData = res.data;
        toast.success(
          isUserMode ? "Custom Pattern Saved!" : "System Pattern Created!",
        );
      }

      if (onSuccess) onSuccess(savedData);
      handleCleanupAndClose();
    } catch (err) {
      console.error(err);
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
  const hasLongSections = longSectionsCount > 0;

  if (loading) {
    return (
      <TMLoader
        message={patternToEdit ? "Updating Pattern..." : "Creating Pattern..."}
      />
    );
  }

  return (
    <div className="pp-fade-in">
      <div className="pp-form-header">
        {!isUserMode && (
          <button
            className="pp-btn-back"
            type="button"
            onClick={handleSafeBack}
          >
            <FaArrowLeft /> <span>Back</span>
          </button>
        )}
        <h3 className="pp-form-title">
          {patternToEdit ? "Edit Pattern" : "Create Pattern"}
        </h3>
        <div style={{ width: isUserMode ? "0px" : "80px" }}></div>
      </div>

      <div className="pp-form-wrapper">
        <form onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          <div className="pp-card pp-mb-4">
            <h5 className="pp-section-heading">Basic Configuration</h5>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Pattern Name</label>
                <input
                  className="pp-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. 9th Physics Custom"
                  required
                />
              </div>

              {/* CATEGORY DROPDOWN */}
              <div className="pp-form-group">
                <label className="pp-label">Pattern Category</label>
                <select
                  className="pp-input pp-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {PATTERN_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Class</label>
                <select
                  className="pp-input pp-select"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  disabled={!!preFilledGrade}
                >
                  <option value="9th">9th Class</option>
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                </select>
              </div>
              <div className="pp-form-group">
                <label className="pp-label">Subject</label>
                {isUserMode ? (
                  <div
                    className="pp-input pp-disabled-input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    {subjectsList.find((s) => s._id === formData.subject)
                      ?.subjectName ||
                      preFilledSubject ||
                      "Loading..."}
                  </div>
                ) : (
                  <select
                    className="pp-input pp-select"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {subjectsList.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subjectName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Time Allowed</label>
                <input
                  className="pp-input"
                  name="timeAllowed"
                  value={formData.timeAllowed}
                  onChange={handleChange}
                />
              </div>
              <div
                className="pp-form-group"
                style={{ display: "flex", alignItems: "center" }}
              >
                <label className="pp-checkbox-label">
                  <input
                    type="checkbox"
                    name="isPairingSpecific"
                    checked={formData.isPairingSpecific}
                    onChange={handleChange}
                  />
                  <span className="ms-2">Enable Strict Pairing Scheme</span>
                </label>
              </div>
            </div>

            <div className="pp-row-2">
              {hasLongSections && (
                <div
                  className="pp-form-group"
                  style={{
                    border: "1px solid #3b82f6",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                  }}
                >
                  <label className="pp-label text-primary">
                    <FaLayerGroup className="me-1" /> Total Long Qs to Attempt
                  </label>
                  <input
                    type="number"
                    className="pp-input"
                    name="longQAttemptCount"
                    value={formData.longQAttemptCount}
                    onChange={handleChange}
                    min="1"
                    max={longSectionsCount}
                    placeholder="e.g. 2"
                  />
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    Max: {longSectionsCount} (Based on Added Sections)
                  </small>
                </div>
              )}
            </div>

            <div className="pp-info-bar">
              Total Marks: <strong>{formData.totalMarks}</strong>
            </div>
          </div>

          <h4 className="pp-section-title-large">Structure Definition</h4>
          {formData.sections.map((sec, idx) => (
            <div key={idx} className="pp-section-card">
              <div className="pp-section-header">
                <div className="d-flex align-items-center gap-2">
                  <input
                    className="pp-input-inline fw-bold"
                    value={sec.questionNo}
                    onChange={(e) =>
                      handleSectionChange(idx, "questionNo", e.target.value)
                    }
                    style={{ width: "60px" }}
                  />
                  <input
                    className="pp-input-inline"
                    value={sec.sectionTitle}
                    onChange={(e) =>
                      handleSectionChange(idx, "sectionTitle", e.target.value)
                    }
                    placeholder="Section Title"
                  />
                </div>
                <button
                  type="button"
                  className="pp-btn-remove"
                  onClick={() => initiateRemoveSection(idx)}
                >
                  <FaTrashAlt />
                </button>
              </div>

              <div className="pp-row-2">
                <div className="pp-form-group">
                  <label className="pp-label">Question Type</label>
                  <select
                    className="pp-input pp-select"
                    value={sec.questionType}
                    onChange={(e) =>
                      handleSectionChange(idx, "questionType", e.target.value)
                    }
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="SHORT">Short Answer</option>
                    <option value="LONG">Long Question</option>
                  </select>
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">Default Category</label>
                  <select
                    className={`pp-input pp-select ${
                      sec.hasParts ? "pp-disabled-input" : ""
                    }`}
                    value={sec.questionCategory}
                    onChange={(e) =>
                      handleSectionChange(
                        idx,
                        "questionCategory",
                        e.target.value,
                      )
                    }
                    disabled={sec.hasParts}
                  >
                    {currentCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pp-row-3">
                <div className="pp-form-group">
                  <label className="pp-label">Total Qs</label>
                  <input
                    type="number"
                    className="pp-input"
                    value={sec.totalQuestions}
                    onChange={(e) =>
                      handleSectionChange(idx, "totalQuestions", e.target.value)
                    }
                    min="1"
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">To Attempt</label>
                  <input
                    type="number"
                    className={`pp-input ${
                      sec.questionType === "MCQ" ? "pp-disabled-input" : ""
                    }`}
                    value={sec.toAttempt}
                    onChange={(e) =>
                      handleSectionChange(idx, "toAttempt", e.target.value)
                    }
                    readOnly={sec.questionType === "MCQ"}
                    min="1"
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">Marks Each</label>
                  <input
                    type="number"
                    className={`pp-input ${
                      sec.hasParts ? "pp-disabled-input" : ""
                    }`}
                    value={sec.hasParts ? 0 : sec.marksPerQuestion}
                    onChange={(e) =>
                      handleSectionChange(
                        idx,
                        "marksPerQuestion",
                        e.target.value,
                      )
                    }
                    readOnly={sec.hasParts}
                    placeholder={sec.hasParts ? "Set in Parts" : "2"}
                  />
                </div>
              </div>

              {formData.isPairingSpecific && (
                <div className="pp-form-group pp-mt-2">
                  <label className="pp-label text-accent">
                    <FaLayerGroup /> Pairing Scheme
                  </label>
                  <Select
                    isMulti
                    options={selectOptions}
                    value={chaptersList.filter((opt) =>
                      sec.linkedChapters.includes(opt.value),
                    )}
                    onChange={(selected, actionMeta) =>
                      handleChapterSelect(idx, selected, actionMeta)
                    }
                    filterOption={customFilterOption}
                    classNamePrefix="select"
                    placeholder="Type Chapter No..."
                    isDisabled={!formData.subject}
                    menuPortalTarget={document.body}
                    styles={customStyles}
                  />
                </div>
              )}

              {sec.questionType === "LONG" && (
                <div className="pp-mt-2 border-top pt-2">
                  <div className="d-flex gap-4 mb-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={sec.hasParts}
                        onChange={(e) =>
                          handleSectionChange(idx, "hasParts", e.target.checked)
                        }
                      />
                      <label className="form-check-label fw-bold small">
                        Enable Sub-Parts
                      </label>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={sec.isCompulsory || false}
                        onChange={(e) =>
                          handleSectionChange(
                            idx,
                            "isCompulsory",
                            e.target.checked,
                          )
                        }
                        style={{
                          backgroundColor: sec.isCompulsory ? "#ef4444" : "",
                          borderColor: sec.isCompulsory ? "#ef4444" : "",
                        }}
                      />
                      <label
                        className={`form-check-label fw-bold small ${
                          sec.isCompulsory ? "text-danger" : ""
                        }`}
                      >
                        Mark as Compulsory
                      </label>
                    </div>
                  </div>
                  {sec.hasParts && (
                    <div className="pp-parts-container mt-2">
                      {sec.subQuestions.map((part, pIdx) => (
                        <div key={pIdx} className="pp-part-row">
                          <input
                            className="pp-input-sm"
                            value={part.label}
                            onChange={(e) =>
                              handlePartChange(
                                idx,
                                pIdx,
                                "label",
                                e.target.value,
                              )
                            }
                            placeholder="(a)"
                          />
                          <select
                            className="pp-input-sm"
                            value={part.questionCategory}
                            onChange={(e) =>
                              handlePartChange(
                                idx,
                                pIdx,
                                "questionCategory",
                                e.target.value,
                              )
                            }
                          >
                            {currentCategories.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="pp-input-sm"
                            value={part.marks}
                            onChange={(e) =>
                              handlePartChange(
                                idx,
                                pIdx,
                                "marks",
                                e.target.value,
                              )
                            }
                            placeholder="Marks"
                            style={{ width: "60px" }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-decoration-none"
                        onClick={() => addSubQuestion(idx)}
                      >
                        <FaPlus /> Add Part
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button type="button" className="pp-btn-dashed" onClick={addSection}>
            <FaPlus /> Add New Question Block
          </button>

          <div className="pp-footer-actions">
            <button
              type="button"
              className="pp-btn-cancel"
              onClick={handleSafeBack}
            >
              Cancel
            </button>
            <button type="submit" className="pp-btn-submit" disabled={loading}>
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

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleCleanupAndClose}
        title="Unsaved Changes"
        message="Discard changes?"
        confirmText="Discard"
        cancelText="Keep Editing"
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={sectionToDelete !== null}
        onClose={() => setSectionToDelete(null)}
        onConfirm={confirmRemoveSection}
        title="Delete Section?"
        message="Are you sure you want to remove this section? This cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default PatternForm;
