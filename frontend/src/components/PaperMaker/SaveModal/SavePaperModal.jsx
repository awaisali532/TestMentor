import React, { useState, useEffect } from "react";
import {
  FaSave,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./SavePaperModal.css";

const SavePaperModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  initialTitle,
}) => {
  const [paperTitle, setPaperTitle] = useState("");

  // ✅ Jab Modal khule, agar purana title hai to wo set karo
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

  // Logic to check change
  const isEditing = !!initialTitle; // Kya hum edit kar rahe hain?
  const isNameChanged = initialTitle && paperTitle !== initialTitle; // Kya naam badla?

  return (
    <div className="sp-overlay">
      <div className="sp-content">
        <div className="sp-header">
          <h3>{isEditing ? "Update Paper" : "Save Paper"}</h3>
          <button onClick={onClose}>
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
            />

            {/* ✅ Smart Hint Text */}
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
                <FaExclamationTriangle className="inline-icon" /> Name changed.
                This will be saved as a <b>NEW</b> paper.
              </p>
            )}
          </div>

          <div className="sp-footer">
            <button type="button" className="sp-btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sp-btn save" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSave />}

              {/* ✅ Button Text Logic */}
              {loading
                ? "Saving..."
                : isEditing
                ? isNameChanged
                  ? "Save as New"
                  : "Update Paper"
                : "Save Paper"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavePaperModal;
