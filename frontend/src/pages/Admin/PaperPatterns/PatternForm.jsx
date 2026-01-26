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
import { getCategoriesForSubject } from "../../../config/SubjectConfig";
import Select from "react-select";
import "./PaperPatterns.css";

// Constants
const selectAllOption = { label: "Select All", value: "ALL" };

// ✅ SMART SEARCH FILTER
const customFilterOption = (option, inputValue) => {
  const { label, value } = option;
  const search = inputValue.toLowerCase();
  const text = label.toLowerCase();

  // 1. Agar "Select All" hai to hamesha dikhao
  if (value === "ALL") return true;

  // 2. Number Search
  const startsWithNumber =
    text.startsWith(`${search} -`) || text.startsWith(`${search}-`);

  // 3. Name Search
  const matchesName = text.includes(search);

  return startsWithNumber || matchesName;
};

const TYPE_LABELS = {
  MCQ: "Multiple Choice Questions",
  SHORT: "Short Questions",
  LONG: "Long Questions",
  THEORY: "Theory Section",
  COMPULSORY: "Compulsory Section",
};

const PatternForm = ({ onClose, initialData, isUserMode, onSuccess }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const { setIsEditing } = useUI();
  const { user } = useUser();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // --- DEFAULT STATE ---
  const defaultState = {
    name: "",
    className: "9th",
    subject: "",
    totalMarks: 0,
    timeAllowed: "2:00 Hours",
    isPairingSpecific: false,
    longQAttemptCount: 2,
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

  // ✅ MEMOIZE OPTIONS
  const selectOptions = useMemo(() => {
    return [selectAllOption, ...chaptersList];
  }, [chaptersList]);

  // ✅ CUSTOM STYLES FOR REACT-SELECT (Fixes Highlight Issue)
  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--bg-body)", // Uses CSS Variable
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
      // Highlight Logic: Selected = Dark Blue, Focused (Keyboard) = Light Blue
      backgroundColor: state.isSelected
        ? "var(--accent-1)"
        : state.isFocused
          ? "rgba(37, 99, 235, 0.1)"
          : "transparent",
      color: state.isSelected ? "white" : "var(--text-main)",
      cursor: "pointer",
      ":active": {
        backgroundColor: "var(--accent-1)",
        color: "white",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--text-main)",
    }),
    input: (base) => ({
      ...base,
      color: "var(--text-main)",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      borderRadius: "5px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--text-main)",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#ef4444",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#ef4444",
        color: "white",
      },
    }),
  };

  // 1. FETCH SUBJECTS
  const fetchSubjects = async (clsName) => {
    if (!clsName) return;
    try {
      setSubjectsList([]);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/subjects?className=${clsName}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubjectsList(res.data);
    } catch (err) {
      console.error("Failed to load subjects", err);
    }
  };

  useEffect(() => {
    if (formData.className) {
      fetchSubjects(formData.className);
    }
  }, [formData.className]);

  // 2. FETCH CHAPTERS
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

      const sortedData = res.data.sort((a, b) => {
        return (a.chapterNumber || 0) - (b.chapterNumber || 0);
      });

      const options = sortedData.map((ch) => {
        let displayName = "Untitled";
        if (ch.name) {
          if (typeof ch.name === "object" && ch.name.en)
            displayName = ch.name.en;
          else if (typeof ch.name === "string") displayName = ch.name;
        }

        return {
          value: ch._id,
          label: `${ch.chapterNumber} - ${displayName}`,
        };
      });

      setChaptersList(options);
    } catch (err) {
      console.error("Failed to load chapters");
    }
  };

  // 3. LOAD INITIAL DATA
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultState,
        ...initialData,
        className: initialData.className || "9th",
        subject: initialData.subject?._id || initialData.subject || "",
        sections:
          initialData.sections?.map((sec) => ({
            ...sec,
            toAttempt: sec.toAttempt || sec.toBeAttempted || 0,
            linkedChapters: sec.linkedChapters || [],
            subQuestions: sec.subQuestions || [],
          })) || defaultState.sections,
      });

      const subjId = initialData.subject?._id || initialData.subject;
      if (subjId) fetchChapters(subjId);
    }
  }, [initialData]);

  // AUTO-CALCULATE TOTAL MARKS
  useEffect(() => {
    const sections = formData.sections || [];

    const compulsoryTotal = sections.reduce((sum, sec) => {
      if (sec.questionType === "LONG") return sum;
      const attempt = parseInt(sec.toAttempt) || 0;
      const marks = parseInt(sec.marksPerQuestion) || 0;
      return sum + attempt * marks;
    }, 0);

    const longSections = sections.filter((s) => s.questionType === "LONG");
    let longTotal = 0;

    if (longSections.length > 0) {
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

      longTotal = marksPerLongQ * (parseInt(formData.longQAttemptCount) || 0);
    }

    setFormData((prev) => ({
      ...prev,
      totalMarks: compulsoryTotal + longTotal,
    }));
  }, [formData.sections, formData.longQAttemptCount]);

  // HANDLERS
  const handleSafeBack = () =>
    isDirty ? setShowExitConfirm(true) : handleCleanupAndClose();

  const handleCleanupAndClose = () => {
    localStorage.removeItem("pp_form_backup");
    setIsEditing(false);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name === "className") {
      setFormData({
        ...formData,
        className: val,
        subject: "",
        sections: formData.sections.map((s) => ({ ...s, linkedChapters: [] })),
      });
    } else if (name === "subject") {
      fetchChapters(val);
      const resetSections = formData.sections.map((s) => ({
        ...s,
        linkedChapters: [],
      }));
      setFormData({ ...formData, subject: val, sections: resetSections });
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
          totalQuestions: 0,
          toAttempt: 0,
          marksPerQuestion: 2,
          linkedChapters: [],
          hasParts: false,
          isCompulsory: false, // ✅ NEW FIELD
          subQuestions: [],
        },
      ],
    });
    setIsDirty(true);
  };

  const removeSection = (index) => {
    const updated = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...formData.sections];
    let newVal = value;

    if (["totalQuestions", "toAttempt", "marksPerQuestion"].includes(field)) {
      newVal = parseInt(value) || 0;
      if (newVal < 0) newVal = 0;
    }

    updated[index][field] = newVal;

    if (field === "questionType") {
      updated[index].hasParts = false;
      updated[index].subQuestions = [];

      if (TYPE_LABELS[newVal]) {
        updated[index].sectionTitle = TYPE_LABELS[newVal];
      }

      if (newVal === "MCQ") {
        updated[index].toAttempt = updated[index].totalQuestions;
        updated[index].questionCategory = "MCQ_GENERAL";
      } else if (newVal === "SHORT") {
        updated[index].questionCategory = "TEXT";
      }
    }

    if (updated[index].questionType === "MCQ") {
      if (field === "totalQuestions") updated[index].toAttempt = newVal;
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

    setLoading(true);

    const payload = {
      ...formData,
      gradeLevel: formData.className,
      isSystemPreset: isUserMode ? false : true,
      createdBy: user?._id,
    };

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (initialData && initialData._id) {
        await axios.put(
          `${BASE_URL}/api/patterns/${initialData._id}`,
          payload,
          config,
        );
        toast.success("Pattern Updated!");
      } else {
        await axios.post(`${BASE_URL}/api/patterns`, payload, config);
        toast.success("Pattern Created!");
      }

      onSuccess && onSuccess();
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

  return (
    <div className="pp-fade-in">
      <div className="pp-form-header">
        <button className="pp-btn-back" type="button" onClick={handleSafeBack}>
          <FaArrowLeft /> <span>Back</span>
        </button>
        <h3 className="pp-form-title">
          {initialData?._id ? "Edit Pattern" : "Create Pattern"}
        </h3>
        <div style={{ width: "80px" }}></div>
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
                  placeholder="e.g. 9th Physics LHR Board"
                  required
                />
              </div>
              <div className="pp-form-group">
                <label className="pp-label">Class</label>
                <select
                  className="pp-input pp-select"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                >
                  <option value="9th">9th Class</option>
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                </select>
              </div>
            </div>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Subject</label>
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
              </div>

              <div className="pp-form-group">
                <label className="pp-label">Time Allowed</label>
                <input
                  className="pp-input"
                  name="timeAllowed"
                  value={formData.timeAllowed}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Long Qs to Attempt</label>
                <input
                  type="number"
                  className="pp-input"
                  name="longQAttemptCount"
                  value={formData.longQAttemptCount}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 2"
                  title="Total Long Questions mein se kitnay karne hain?"
                />
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  Used for Total Marks calculation
                </small>
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

            <div className="pp-info-bar">
              Total Marks: <strong>{formData.totalMarks}</strong>
            </div>
          </div>

          {/* ✅ STYLED HEADING HERE */}
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
                  onClick={() => removeSection(idx)}
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
                    className={`pp-input pp-select ${sec.hasParts ? "pp-disabled-input" : ""}`}
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
                  {sec.hasParts && (
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Category defined in parts
                    </small>
                  )}
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
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">To Attempt</label>
                  <input
                    type="number"
                    className={`pp-input ${sec.questionType === "MCQ" ? "pp-disabled-input" : ""}`}
                    value={sec.toAttempt}
                    onChange={(e) =>
                      handleSectionChange(idx, "toAttempt", e.target.value)
                    }
                    readOnly={sec.questionType === "MCQ"}
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">Marks Each</label>
                  <input
                    type="number"
                    className={`pp-input ${sec.hasParts ? "pp-disabled-input" : ""}`}
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
                  {sec.hasParts && (
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Calculated from parts
                    </small>
                  )}
                </div>
              </div>

              {/* CHAPTER SELECT (Styled with styles prop) */}
              {formData.isPairingSpecific && (
                <div className="pp-form-group pp-mt-2">
                  <label className="pp-label text-accent">
                    <FaLayerGroup /> Pairing Scheme (Linked Chapters)
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
                    tabSelectsValue={true}
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Type Chapter No (e.g. 5)..."
                    isDisabled={!formData.subject}
                    menuPortalTarget={document.body}
                    // ✅ FIXED STYLES HERE
                    styles={customStyles}
                    noOptionsMessage={() => "No chapters found"}
                  />
                  {!formData.subject && (
                    <small className="text-danger">
                      Select a Subject first!
                    </small>
                  )}
                </div>
              )}

              {/* ... inside sections map ... */}

              {sec.questionType === "LONG" && (
                <div className="pp-mt-2 border-top pt-2">
                  {/* ✅ TOGGLES ROW */}
                  <div className="d-flex gap-4 mb-2">
                    {/* 1. Sub-Parts Switch */}
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

                    {/* 2. ✅ NEW: Compulsory Switch */}
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
                        className={`form-check-label fw-bold small ${sec.isCompulsory ? "text-danger" : ""}`}
                      >
                        Mark as Compulsory (Lazmi)
                      </label>
                    </div>
                  </div>

                  {/* Parts Container (Existing Code) */}
                  {sec.hasParts && (
                    <div className="pp-parts-container mt-2">
                      {sec.subQuestions.map((part, pIdx) => (
                        <div key={pIdx} className="pp-part-row">
                          {/* ... inner inputs ... */}
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
    </div>
  );
};

export default PatternForm;
