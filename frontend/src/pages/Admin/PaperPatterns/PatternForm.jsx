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
import Swal from "sweetalert2";
import Select from "react-select";
import { useUser } from "../../../context/UserContext";

const PATTERN_CATEGORIES = [
  { value: "GENERAL", label: "General / Mixed" },
  { value: "FULL_BOOK", label: "Full Book (Board Pattern)" },
  { value: "HALF_BOOK", label: "Half Book" },
  { value: "CHAPTER_WISE", label: "Chapter Wise (Short Test)" },
];

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
    () => [{ label: "Select All", value: "ALL" }, ...chaptersList],
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

  useEffect(() => {
    const initializeForm = async () => {
      setFormData(
        patternToEdit
          ? {
              ...patternToEdit,
              className: patternToEdit.gradeLevel || preFilledGrade || "9th",
              subject:
                patternToEdit.subject?._id || patternToEdit.subject || "",
            }
          : {
              ...defaultState,
              className: preFilledGrade || "9th",
              subject: preFilledSubject || "",
            },
      );
    };
    initializeForm();
  }, []);

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
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Pattern Name is required");
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

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
        <button
          onClick={handleSafeBack}
          className="p-2 bg-pill-bg text-muted hover:text-main rounded-lg transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h3 className="text-2xl font-extrabold text-main m-0">
          {patternToEdit ? "Edit Pattern" : "Create Custom Pattern"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h5 className="font-bold text-main mb-4">Basic Configuration</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-main mb-2">
                Pattern Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. 9th Physics Custom"
                required
                className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-main mb-2">
                Pattern Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              >
                {PATTERN_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-main mb-2">
                Time Allowed
              </label>
              <input
                name="timeAllowed"
                value={formData.timeAllowed}
                onChange={handleChange}
                className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer mt-6">
                <input
                  type="checkbox"
                  name="isPairingSpecific"
                  checked={formData.isPairingSpecific}
                  onChange={handleChange}
                  className="w-5 h-5 accent-accent-1"
                />
                <span className="font-bold text-main">
                  Enable Strict Pairing Scheme
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
            className="px-6 py-2.5 rounded-xl font-bold bg-accent-1 text-white hover:bg-accent-2 transition-colors flex items-center gap-2 cursor-pointer"
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
