import React from "react";
import "./QuestionCard.css";

const QuestionCard = ({ question, isSelected, onToggle }) => {
  // Extract Text safely
  // Handle case where statement is string or object
  const textEn =
    typeof question.statement === "object"
      ? question.statement.en
      : question.statement;
  const textUr =
    typeof question.statement === "object" ? question.statement.ur : null;

  // ✅ SMART LAYOUT LOGIC
  // Agar English text 85 characters se zyada hai, ya Urdu text bohat lamba hai -> Stack Mode
  const isLongText =
    (textEn && textEn.length > 85) || (textUr && textUr.length > 85);
  const layoutClass = isLongText ? "layout-stacked" : "layout-row";

  return (
    <div
      className={`qc-card ${isSelected ? "selected" : ""}`}
      onClick={() => onToggle(question)}
    >
      <div className="qc-body">
        {/* ✅ DYNAMIC CONTENT WRAPPER */}
        <div className={`qc-content-wrapper ${layoutClass}`}>
          {/* English Section */}
          <div className="qc-text-en">
            <span className="qc-q-label">Q. </span>
            {textEn}
          </div>

          {/* Urdu Section */}
          {textUr && (
            <div className="qc-text-ur" dir="rtl">
              {textUr}
            </div>
          )}
        </div>

        {/* Tags / Meta Info */}
        <div className="qc-meta">
          <span className="qc-tag cat">{question.questionCategory}</span>
          <span className={`qc-tag diff ${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
          <span className="qc-marks">Marks: {question.marks}</span>
        </div>
      </div>

      {/* Selection Indicator */}
      <div className="qc-select-indicator">
        <div className={`qc-checkbox ${isSelected ? "checked" : ""}`}></div>
      </div>
    </div>
  );
};

export default QuestionCard;
