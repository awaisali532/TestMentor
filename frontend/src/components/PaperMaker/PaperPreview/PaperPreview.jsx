import React from "react";
import { FaPlusCircle, FaRegFileAlt } from "react-icons/fa";
import "./PaperPreview.css";

const PaperPreview = ({ paperData, questions = [], onOpenMenu }) => {
  // --- 1. SORTING LOGIC ---
  const mcqs = questions.filter((q) => q.type === "MCQ");
  const shortQs = questions.filter((q) => q.type === "SHORT");
  const longQs = questions.filter((q) => q.type === "LONG");

  const hasQuestions = questions.length > 0;

  return (
    <div className="preview-container">
      {/* EMPTY STATE */}
      {!hasQuestions ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FaRegFileAlt />
          </div>
          <h3>Start Building Your Paper</h3>
          <p>
            Click on <strong>"Question's Menu"</strong> in the sidebar to browse
            and add questions.
          </p>
          {/* Button ab Parent ka onOpenMenu function call karega agar pass kia ho */}
          <button className="btn-start-add" onClick={onOpenMenu}>
            <FaPlusCircle /> Open Question Menu
          </button>
        </div>
      ) : (
        <div className="questions-list fade-in">
          {/* --- HEADER INFO (Optional - Just for context) --- */}
          <div className="preview-header">
            <h2>
              {paperData?.grade} - {paperData?.subject}
            </h2>
            <span>Total Questions: {questions.length}</span>
          </div>

          {/* --- SECTION 1: MCQs --- */}
          {mcqs.length > 0 && (
            <div className="paper-section">
              <h4 className="sec-heading">Q.1 Multiple Choice Questions</h4>
              <div className="qs-grid">
                {mcqs.map((q, i) => (
                  <div key={q._id || i} className="qs-item">
                    <span className="qs-num">{i + 1}.</span>
                    <span className="qs-text">{q.questionText}</span>
                  </div>
                ))}
              </div>
              <div className="sec-divider"></div>
            </div>
          )}

          {/* --- SECTION 2: SHORT QUESTIONS --- */}
          {shortQs.length > 0 && (
            <div className="paper-section">
              <h4 className="sec-heading">Q.2 Short Questions</h4>
              <div className="qs-list">
                {shortQs.map((q, i) => (
                  <div key={q._id || i} className="qs-item">
                    <span className="qs-num">{i + 1}.</span>
                    <span className="qs-text">{q.questionText}</span>
                  </div>
                ))}
              </div>
              <div className="sec-divider"></div>
            </div>
          )}

          {/* --- SECTION 3: LONG QUESTIONS --- */}
          {longQs.length > 0 && (
            <div className="paper-section">
              <h4 className="sec-heading">Q.3 Long Questions</h4>
              <div className="qs-list">
                {longQs.map((q, i) => (
                  <div key={q._id || i} className="qs-item">
                    <span className="qs-num">{i + 1}.</span>
                    <span className="qs-text">{q.questionText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperPreview;
