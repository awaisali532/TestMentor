import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import Loader from "../../../../components/ui/Loader";

const SavePaperModal = ({ isOpen, onClose, onConfirm, loading, paperData }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    timeAllowed: "",
    examDate: "",
    totalMarks: 0,
  });

  useEffect(() => {
    if (isOpen && paperData) {
      const today = new Date().toISOString().split("T")[0];

      let formattedDate = today;
      if (paperData.examDate) {
        try {
          formattedDate = new Date(paperData.examDate)
            .toISOString()
            .split("T")[0];
        } catch (e) {
          formattedDate = today;
        }
      }

      setFormData({
        title:
          paperData.title === "Untitled Paper" ? "" : paperData.title || "",
        category: paperData.examLabel || paperData.syllabusLabel || "",
        timeAllowed: paperData.selectedPattern?.timeAllowed || "",
        examDate: formattedDate,
        totalMarks: paperData.selectedPattern?.totalMarks || 0,
      });
    }
  }, [isOpen, paperData]);

  if (!isOpen) return null;

  const isSystemPreset = paperData?.selectedPattern?.isSystemPreset;

  const originalTitle =
    paperData?.title === "Untitled Paper" ? "" : paperData?.title;
  const isEditing = !!originalTitle;
  const isNameChanged =
    isEditing && formData.title.trim() !== originalTitle.trim();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.timeAllowed.trim() ||
      !formData.examDate
    ) {
      return;
    }
    onConfirm(formData);
  };

  return (
    <>
      {/* ✅ FIXED: Loader is now wrapped in a high z-index container so it stays on TOP of everything */}
      {loading && (
        <div className="fixed inset-0 z-99999 bg-black/60 backdrop-blur-sm flex justify-center items-center">
          <Loader fullScreen={false} text="Saving Paper..." />
        </div>
      )}

      {/* When loading is true, we slightly fade out the modal and block its clicks */}
      <div
        className={`fixed inset-0 z-3000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 ${loading ? "opacity-50 pointer-events-none" : "animate-fade-in"}`}
      >
        <div className="bg-white dark:bg-card w-full max-w-lg rounded-xl shadow-2xl overflow-hidden scale-in-center">
          <div className="bg-[#2d1b6b] px-6 py-4 flex justify-between items-center">
            <h2 className="text-white text-lg font-bold m-0">Save Paper</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[0.95rem] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Paper Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g. 9th physics ch 3 academy"
                className="w-full bg-white dark:bg-bg-body border border-slate-300 dark:border-border text-slate-900 dark:text-main px-3 py-2.5 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.95rem] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Paper Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g. chapter test"
                className="w-full bg-white dark:bg-bg-body border border-slate-300 dark:border-border text-slate-900 dark:text-main px-3 py-2.5 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.95rem] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Time Allowed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="timeAllowed"
                required
                value={formData.timeAllowed}
                onChange={handleChange}
                disabled={isSystemPreset || loading}
                placeholder="e.g. 45 mints"
                className={`w-full border px-3 py-2.5 rounded-md transition-all focus:outline-none ${
                  isSystemPreset
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-white dark:bg-bg-body border-slate-300 dark:border-border text-slate-900 dark:text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {isSystemPreset && (
                <span className="text-[0.75rem] text-slate-500 mt-1.5 block font-medium">
                  *Time is locked for Admin Presets.
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.95rem] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Paper Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="examDate"
                  required
                  value={formData.examDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-white dark:bg-bg-body border border-slate-300 dark:border-border text-slate-900 dark:text-main px-3 py-2.5 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[0.95rem] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Total Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.totalMarks}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 px-3 py-2.5 rounded-md cursor-not-allowed text-center font-bold"
                />
              </div>
            </div>

            {isEditing && !isNameChanged && (
              <p className="text-[0.85rem] text-blue-600 bg-blue-600/10 p-2.5 rounded-md mt-1 mb-0 border border-blue-600/20">
                This will <b>overwrite</b> your existing saved paper.
              </p>
            )}

            {isEditing && isNameChanged && (
              <p className="text-[0.85rem] text-amber-600 bg-amber-500/10 p-2.5 rounded-md mt-1 mb-0 flex items-center gap-2 border border-amber-500/20">
                <FaExclamationTriangle className="text-base shrink-0" />
                <span>
                  Name changed. This will be saved as a <b>NEW</b> paper.
                </span>
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#4a77e5] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                <FaPlus size={14} />
                SAVE PAPER
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SavePaperModal;
