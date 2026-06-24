import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaExclamationTriangle } from "react-icons/fa"; // ❌ FaSpinner Removed
import TMLoader from "../../../components/common/TMLoader/TMLoader"; // ✅ TMLoader Imported
import "./SavePaperModal.css";

const SavePaperModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  initialTitle,
}) => {
  const [paperTitle, setPaperTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPaperTitle(initialTitle || "");
    }
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
      {/* ✅ CHANGE 1: Full Screen Loader Added Here */}
      {loading && <TMLoader />}

      <div className="sp-overlay">
        <div className="sp-content">
          <div className="sp-header">
            <h3>{isEditing ? "Update Paper" : "Save Paper"}</h3>
            <button onClick={onClose} disabled={loading}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="sp-body">
              <label>Paper Title / Name</label>
              <input
                type="text"
                placeholder="e.g. 9th Class Physics Mid-Term"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                autoFocus
                required
                disabled={loading} // ✅ Input disabled during loading
              />

              {!isEditing && (
                <p className="sp-hint">
                  Give a unique name to find it later easily.
                </p>
              )}

              {isEditing && !isNameChanged && (
                <p className="sp-hint text-blue">
                  This will <b>overwrite</b> the existing paper.
                </p>
              )}

              {isEditing && isNameChanged && (
                <p className="sp-hint text-orange">
                  <FaExclamationTriangle className="inline-icon" /> Name
                  changed. This will be saved as a <b>NEW</b> paper.
                </p>
              )}
            </div>

            <div className="sp-footer">
              <button
                type="button"
                className="sp-btn cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              {/* ✅ CHANGE 2: Button clean kar diya (No Spinner inside) */}
              <button type="submit" className="sp-btn save" disabled={loading}>
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
