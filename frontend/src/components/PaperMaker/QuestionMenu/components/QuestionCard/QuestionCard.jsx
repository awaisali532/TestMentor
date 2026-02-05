import React from "react";
// ✅ IMPORT FROM COMMON
import RenderText from "../../../../../components/common/RenderText";
import "./QuestionCard.css";

const QuestionCard = ({ question, index, isSelected, onToggle }) => {
  // Extract Text safely
  const textEn = question.statement?.en || "";
  const textUr = question.statement?.ur || null;

  // =======================================================
  // 🔥 FIX: HANDLE CATEGORY (ARRAY vs STRING)
  // =======================================================
  let rawCategory = question.questionCategory;

  // 1. Agar Array hai (e.g., ["MCQ"]), to pehla item utha lo styling ke liye
  if (Array.isArray(rawCategory)) {
    rawCategory = rawCategory.length > 0 ? rawCategory[0] : "General";
  }

  // 2. Class generate kro (lowercase + no spaces)
  const categoryClass = rawCategory
    ? String(rawCategory).toLowerCase().replace(/\s+/g, "")
    : "general";

  // 3. Display Text (Agar array hai to join krke dikhao, warna string)
  const categoryText = Array.isArray(question.questionCategory)
    ? question.questionCategory.join(", ")
    : question.questionCategory || "General";

  return (
    <div
      className={`qc-card ${isSelected ? "selected" : ""}`}
      onClick={() => onToggle(question)}
    >
      <div className="qc-body">
        {/* --- 50/50 SPLIT LAYOUT --- */}
        <div className="qc-split-container">
          {/* LEFT: English */}
          <div className="qc-split-left">
            <span className="qc-q-label">Q.{index} </span>
            <RenderText text={textEn} />
          </div>

          {/* RIGHT: Urdu */}
          {textUr && (
            <div className="qc-split-right" dir="rtl">
              <span className="qc-q-label-ur">{index}.</span>
              <RenderText text={textUr} />
            </div>
          )}
        </div>

        {/* ✅ IMAGE DISPLAY */}
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
                const label = String.fromCharCode(65 + i); // A, B, C...
                const optEn = opt.en || "";
                const optUr = opt.ur || "";

                return (
                  <div key={i} className="qc-option-item">
                    <div className="opt-left">
                      <span className="opt-label">({label})</span>
                      <span className="opt-text-en">
                        <RenderText text={optEn} />
                      </span>
                    </div>

                    {optUr && (
                      <div className="opt-right" dir="rtl">
                        <span className="opt-text-ur">
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
            {/* ✅ UPDATED CATEGORY TAG */}
            <span className={`qc-tag cat ${categoryClass}`}>
              {categoryText}
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
