import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft, FaPlus, FaTrashAlt, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUI } from "../../../context/UIContext";
import { useTheme } from "../../../context/ThemeContext";
import { useUser } from "../../../context/UserContext";
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";
import "./PaperPatterns.css";

const PatternForm = ({ onClose, initialData, isUserMode, onSuccess }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const { setIsEditing } = useUI();
  const { theme } = useTheme();
  const { user } = useUser();

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // --- DEFAULT STATE ---
  const defaultState = {
    presetName: "",
    gradeLevel: "",
    subjects: "",
    type: "FULL_BOOK",
    totalMarks: 0,
    timeAllowed: "2:00 Hours",
    sections: [
      {
        title: "Q1 - MCQs",
        questionType: "MCQ",
        totalQuestions: 12,
        toBeAttempted: 12,
        marksPerQuestion: 1,
        hasParts: false,
      },
    ],
  };

  const [formData, setFormData] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultState,
        ...initialData,
        gradeLevel: Array.isArray(initialData.gradeLevel)
          ? initialData.gradeLevel.join(", ")
          : initialData.gradeLevel || "",
        subjects: Array.isArray(initialData.subjects)
          ? initialData.subjects.join(", ")
          : initialData.subjects || "",
        sections: initialData.sections || defaultState.sections,
      });
    } else {
      const saved = localStorage.getItem("pp_form_backup");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData({
          ...defaultState,
          sections: parsed.sections || defaultState.sections,
        });
        setIsDirty(true);
      }
    }
  }, [initialData]);

  // --- 2. AUTO-CALCULATE TOTAL MARKS ---
  useEffect(() => {
    const sections = formData.sections || [];
    const newTotal = sections.reduce((sum, sec) => {
      const attempt = parseInt(sec.toBeAttempted) || 0;
      const marks = parseInt(sec.marksPerQuestion) || 0;
      return sum + attempt * marks;
    }, 0);

    setFormData((prev) => ({ ...prev, totalMarks: newTotal }));
  }, [formData.sections]);

  // --- 3. EDITING MODE ---
  useEffect(() => {
    setIsEditing(true);
    return () => setIsEditing(false);
  }, [setIsEditing]);

  // --- 4. AUTO-SAVE ---
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem("pp_form_backup", JSON.stringify(formData));
    }
  }, [formData, isDirty]);

  // --- HANDLERS ---
  const handleCleanupAndClose = () => {
    localStorage.removeItem("pp_form_backup");
    setIsEditing(false);
    onClose();
  };

  const handleSafeBack = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      handleCleanupAndClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsDirty(true);
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...(formData.sections || []),
        {
          title: "",
          questionType: "SHORT",
          totalQuestions: 0,
          toBeAttempted: 0,
          marksPerQuestion: 2,
          hasParts: false,
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

  // ✅ LOGIC UPDATE: Handle Inputs & MCQ Restriction
  const handleSectionChange = (index, field, value) => {
    const updated = [...formData.sections];
    let newVal = value;

    if (
      ["totalQuestions", "toBeAttempted", "marksPerQuestion"].includes(field)
    ) {
      newVal = parseInt(value) || 0;
      if (newVal < 0) newVal = 0;
    }

    updated[index][field] = newVal;

    // ✅ MCQ LOGIC: If type is MCQ, Attempt must equal Total
    if (updated[index].questionType === "MCQ") {
      if (field === "totalQuestions") {
        updated[index].toBeAttempted = newVal; // Auto sync
      }
      if (field === "questionType") {
        // Jab type change ho kar MCQ bane, tab bhi sync kar do
        updated[index].toBeAttempted = updated[index].totalQuestions;
      }
    } else {
      // Normal Logic for other types
      if (field === "toBeAttempted") {
        const total = parseInt(updated[index].totalQuestions) || 0;
        if (newVal > total) {
          toast.error("Attempt cannot be more than Total Questions!");
          updated[index][field] = total;
        }
      }

      if (field === "totalQuestions") {
        const attempt = parseInt(updated[index].toBeAttempted) || 0;
        if (newVal < attempt) {
          updated[index].toBeAttempted = newVal;
        }
      }
    }

    if (field === "hasParts") updated[index][field] = value === "true";

    setFormData({ ...formData, sections: updated });
    setIsDirty(true);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.presetName) return toast.error("Preset Name is required");

    for (let i = 0; i < formData.sections.length; i++) {
      const sec = formData.sections[i];
      const total = parseInt(sec.totalQuestions);
      const attempt = parseInt(sec.toBeAttempted);

      if (total === 0)
        return toast.error(`Section ${i + 1}: Total Questions cannot be 0!`);
      if (attempt === 0)
        return toast.error(`Section ${i + 1}: 'To Attempt' cannot be 0!`);
      if (attempt > total)
        return toast.error(
          `Section ${i + 1}: Attempt cannot be greater than Total!`
        );

      // Strict Check for MCQ
      if (sec.questionType === "MCQ" && total !== attempt) {
        return toast.error(`Section ${i + 1} (MCQ): Attempt must match Total!`);
      }
    }

    setLoading(true);

    const payload = {
      ...formData,
      gradeLevel:
        typeof formData.gradeLevel === "string"
          ? formData.gradeLevel.split(",").map((s) => s.trim())
          : formData.gradeLevel,
      subjects:
        typeof formData.subjects === "string"
          ? formData.subjects.split(",").map((s) => s.trim())
          : formData.subjects,
      isSystemPreset: isUserMode ? false : true,
      createdBy: user?._id,
    };

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let responseData;

      if (initialData && initialData._id) {
        const res = await axios.put(
          `${BASE_URL}/api/patterns/${initialData._id}`,
          payload,
          config
        );
        toast.success(
          isUserMode
            ? "Custom Pattern Updated!"
            : "Preset Updated Successfully!"
        );
        responseData = res.data;
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/patterns`,
          payload,
          config
        );
        toast.success(
          isUserMode
            ? "Custom Pattern Created!"
            : "Preset Created Successfully!"
        );
        responseData = res.data;
      }

      if (onSuccess) {
        const cleanData = responseData.data || responseData;
        onSuccess(cleanData);
      }

      localStorage.removeItem("pp_form_backup");
      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-fade-in">
      <div className="pp-form-header">
        <button className="pp-btn-back" type="button" onClick={handleSafeBack}>
          <FaArrowLeft /> <span>Back</span>
        </button>
        <h3 className="pp-form-title">
          {initialData?._id ? "Edit Configuration" : "Create Pattern"}
        </h3>
        <div style={{ width: "80px" }}></div>
      </div>

      <div className="pp-form-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="pp-card pp-mb-4">
            <h5 className="pp-section-heading">Basic Info</h5>
            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Preset Name</label>
                <input
                  className="pp-input"
                  name="presetName"
                  value={formData.presetName}
                  onChange={handleChange}
                  placeholder="e.g. 9th Physics"
                  required
                />
              </div>
              <div className="pp-form-group">
                <label className="pp-label">Type</label>
                <select
                  className="pp-input pp-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="FULL_BOOK">Full Book</option>
                  <option value="HALF_BOOK">Half Book</option>
                  <option value="CHAPTER_WISE">Chapter Wise</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
            </div>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Grades (Comma Sep)</label>
                <input
                  className="pp-input"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  placeholder="9th, 10th"
                />
              </div>
              <div className="pp-form-group">
                <label className="pp-label">Subjects (Comma Sep)</label>
                <input
                  className="pp-input"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  placeholder="Physics, Chemistry"
                />
              </div>
            </div>

            <div className="pp-row-2">
              <div className="pp-form-group">
                <label className="pp-label">Total Marks (Auto)</label>
                <input
                  type="number"
                  className="pp-input pp-disabled-input"
                  name="totalMarks"
                  value={formData.totalMarks || 0}
                  readOnly
                />
              </div>
              <div className="pp-form-group">
                <label className="pp-label">Time</label>
                <input
                  className="pp-input"
                  name="timeAllowed"
                  value={formData.timeAllowed}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <h4 className="pp-section-title-large">
            Sections ({formData.sections?.length || 0})
          </h4>

          {formData.sections?.map((sec, idx) => (
            <div key={idx} className="pp-section-card">
              <div className="pp-section-header">
                <div className="pp-sec-badge">Section {idx + 1}</div>
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
                  <label className="pp-label">Title</label>
                  <input
                    className="pp-input"
                    value={sec.title}
                    onChange={(e) =>
                      handleSectionChange(idx, "title", e.target.value)
                    }
                    placeholder="e.g. Short Qs"
                    required
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">Type</label>
                  <select
                    className="pp-input pp-select"
                    value={sec.questionType}
                    onChange={(e) =>
                      handleSectionChange(idx, "questionType", e.target.value)
                    }
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="SHORT">Short</option>
                    <option value="LONG">Long</option>
                    <option value="THEORY">Theory</option>
                    <option value="COMPULSORY">Compulsory</option>
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
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">To Attempt</label>

                  {/* ✅ DISABLE IF MCQ */}
                  <input
                    type="number"
                    className={`pp-input ${
                      sec.questionType === "MCQ" ? "pp-disabled-input" : ""
                    }`}
                    value={sec.toBeAttempted}
                    onChange={(e) =>
                      handleSectionChange(idx, "toBeAttempted", e.target.value)
                    }
                    readOnly={sec.questionType === "MCQ"} // ✅ Read Only Logic
                    title={
                      sec.questionType === "MCQ"
                        ? "Auto-synced with Total for MCQs"
                        : ""
                    }
                  />
                </div>
                <div className="pp-form-group">
                  <label className="pp-label">Marks/Q</label>
                  <input
                    type="number"
                    className="pp-input"
                    value={sec.marksPerQuestion}
                    onChange={(e) =>
                      handleSectionChange(
                        idx,
                        "marksPerQuestion",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {sec.questionType === "LONG" && (
                <div className="pp-form-group pp-mt-2">
                  <label className="pp-label">Has Sub-Parts (A & B)?</label>
                  <select
                    className="pp-input pp-select"
                    value={sec.hasParts ? "true" : "false"}
                    onChange={(e) =>
                      handleSectionChange(idx, "hasParts", e.target.value)
                    }
                  >
                    <option value="false">No (Direct)</option>
                    <option value="true">Yes (With Parts)</option>
                  </select>
                </div>
              )}
            </div>
          ))}

          <button type="button" className="pp-btn-dashed" onClick={addSection}>
            <FaPlus /> Add Section
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
                  <FaSave /> {initialData?._id ? "Update" : "Save"}
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
        message="You have unsaved changes. Discard?"
        confirmText="Discard & Exit"
        cancelText="Keep Editing"
        isDanger={true}
      />
    </div>
  );
};

export default PatternForm;
