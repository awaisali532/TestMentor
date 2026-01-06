import React from "react";
// ✅ IMPORT FROM COMMON (Path check kr lena apne folder structure k hisab se)
import RenderText from "../../../../../components/common/RenderText";
import "./QuestionCard.css";

const QuestionCard = ({ question, index, isSelected, onToggle }) => {
  // Extract Text safely
  const textEn = question.statement?.en || "";
  const textUr = question.statement?.ur || null;

  // Helper for Category Class (for styling tags)
  const categoryClass = question.questionCategory
    ? question.questionCategory.toLowerCase().replace(/\s+/g, "")
    : "general";

  return (
    <div
      className={`qc-card ${isSelected ? "selected" : ""}`}
      onClick={() => onToggle(question)}
    >
      <div className="qc-body">
        {/* --- 50/50 SPLIT LAYOUT --- */}
        <div className="qc-split-container">
          {/* LEFT: English (With Math & Numbering) */}
          <div className="qc-split-left">
            <span className="qc-q-label">Q.{index} </span>
            {/* ✅ RenderText for Math Equations */}
            <RenderText text={textEn} />
          </div>

          {/* RIGHT: Urdu (With Math & RTL & Numbering) */}
          {textUr && (
            <div className="qc-split-right" dir="rtl">
              {/* ✅ URDU NUMBERING ADDED */}
              <span className="qc-q-label-ur">{index}.</span>
              <RenderText text={textUr} />
            </div>
          )}
        </div>

        {/* ✅ IMAGE DISPLAY LOGIC ADDED HERE */}
        {question.image && question.image.url && (
          <div className="qc-image-container">
            <img
              src={question.image.url}
              alt="Question Diagram"
              className="qc-image"
            />
          </div>
        )}

        {/* --- MCQ OPTIONS GRID --- */}
        {question.type === "MCQ" &&
          question.options &&
          question.options.length > 0 && (
            <div className="qc-options-grid">
              {question.options.map((opt, i) => {
                const label = String.fromCharCode(65 + i); // A, B, C, D
                const optEn = opt.en || "";
                const optUr = opt.ur || "";

                return (
                  <div key={i} className="qc-option-item">
                    <div className="opt-left">
                      <span className="opt-label">({label})</span>
                      <span className="opt-text-en">
                        {/* ✅ Render Option English */}
                        <RenderText text={optEn} />
                      </span>
                    </div>

                    {optUr && (
                      <div className="opt-right" dir="rtl">
                        <span className="opt-text-ur">
                          {/* ✅ Render Option Urdu */}
                          <RenderText text={optUr} />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        {/* --- METADATA TAGS --- */}
        <div className="qc-meta">
          <div className="qc-tags-group">
            {/* Category Tag */}
            <span className={`qc-tag cat ${categoryClass}`}>
              {question.questionCategory || "General"}
            </span>

            {/* Difficulty Tag */}
            {question.difficulty && (
              <span
                className={`qc-tag diff ${question.difficulty.toLowerCase()}`}
              >
                {question.difficulty}
              </span>
            )}
          </div>

          <span className="qc-marks">Marks: {question.marks}</span>
        </div>
      </div>

      {/* Checkbox */}
      <div className="qc-select-indicator">
        <div className={`qc-checkbox ${isSelected ? "checked" : ""}`}></div>
      </div>
    </div>
  );
};

export default QuestionCard;
