import React from "react";
import { FaExclamationTriangle, FaTimes, FaCheck } from "react-icons/fa";
import "./ConfirmationModal.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false, // True = Red Button (Delete), False = Blue/Green (Save/Exit)
}) => {
  if (!isOpen) return null;

  return (
    <div className="cm-overlay">
      <div className="cm-box fade-in-up">
        {/* Icon based on type */}
        <div className={`cm-icon-wrapper ${isDanger ? "danger" : "warning"}`}>
          <FaExclamationTriangle />
        </div>

        <h3 className="cm-title">{title}</h3>
        <p className="cm-message">{message}</p>

        <div className="cm-actions">
          <button className="cm-btn cm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>

          <button
            className={`cm-btn ${
              isDanger ? "cm-btn-danger" : "cm-btn-primary"
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isDanger ? (
              <FaTimes className="me-2" />
            ) : (
              <FaCheck className="me-2" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
