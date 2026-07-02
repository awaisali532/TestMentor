import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import Loader from "../../../../components/ui/Loader";

const SavePaperModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  initialTitle,
}) => {
  const [paperTitle, setPaperTitle] = useState("");

  useEffect(() => {
    if (isOpen) setPaperTitle(initialTitle || "");
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;
    onConfirm(paperTitle);
  };

  const isEditing = !!initialTitle;
  const isNameChanged = initialTitle && paperTitle !== initialTitle;

  return (
    <>
      {loading && <Loader fullScreen={true} text="Saving Paper..." />}

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-3000">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="m-0 text-lg text-slate-800 font-bold">
              {isEditing ? "Update Paper" : "Save Paper"}
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="bg-transparent border-none text-lg cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <label className="block font-semibold mb-2 text-sm text-slate-700">
                Paper Title / Name
              </label>
              <input
                type="text"
                placeholder="e.g. 9th Class Physics Mid-Term"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                autoFocus
                required
                disabled={loading}
                className="w-full p-3 border border-slate-300 rounded-lg text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />

              {!isEditing && (
                <p className="text-xs text-slate-400 mt-2">
                  Give a unique name to find it later easily.
                </p>
              )}

              {isEditing && !isNameChanged && (
                <p className="text-[0.85rem] text-blue-600 bg-blue-600/10 p-2.5 rounded-md mt-3">
                  This will <b>overwrite</b> the existing paper.
                </p>
              )}

              {isEditing && isNameChanged && (
                <p className="text-[0.85rem] text-amber-600 bg-amber-500/10 p-2.5 rounded-md mt-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-base shrink-0" />
                  <span>
                    Name changed. This will be saved as a <b>NEW</b> paper.
                  </span>
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg font-semibold cursor-pointer border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg font-semibold cursor-pointer border-none flex items-center gap-2 bg-emerald-500 text-white shadow-md hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                <FaSave />
                {loading
                  ? " Saving..."
                  : isEditing
                    ? isNameChanged
                      ? " Save as New"
                      : " Update Paper"
                    : " Save Paper"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SavePaperModal;
