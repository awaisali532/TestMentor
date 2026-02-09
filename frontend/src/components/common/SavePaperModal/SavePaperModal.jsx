import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import "./SavePaperModal.css";

const SavePaperModal = ({
  isOpen,
  onClose,
  onConfirm,
  defaultTitle,
  isSaving,
}) => {
  const [title, setTitle] = useState(defaultTitle || "");
  const { theme } = useTheme(); // 'light' or 'dark'

  // Reset title when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle || "");
    }
  }, [isOpen, defaultTitle]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && title.trim()) {
      onConfirm(title);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sp-modal-overlay">
      {/* ✅ KEY CHANGE: Using 'u-dark' / 'u-light' classes 
         This triggers the variables from UserLayout.css to apply here 
      */}
      <div
        className={`sp-modal-content ${theme === "dark" ? "u-dark" : "u-light"}`}
      >
        <button className="sp-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="sp-modal-header">
          <h3>Save Paper</h3>
          <p>Enter a unique name to save this paper.</p>
        </div>

        <div className="sp-modal-body">
          <label>Paper Title</label>
          <input
            type="text"
            className="sp-input"
            placeholder="e.g. 9th Class Physics - Chapter 1 Test"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className="sp-modal-footer">
          <button
            className="sp-btn-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            className="sp-btn-save"
            onClick={() => onConfirm(title)}
            disabled={!title.trim() || isSaving}
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <FaSave /> Save Paper
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePaperModal;
