import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PracticeQuestionCard = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Helper to get text based on availability
  const getStatement = () => {
    if (question.statement?.en)
      return { text: question.statement.en, isUrdu: false };
    if (question.statement?.ur)
      return { text: question.statement.ur, isUrdu: true };
    if (question.questionData?.itemA)
      return { text: question.questionData.itemA, isUrdu: false };
    return { text: "Statement not available", isUrdu: false };
  };

  const { text, isUrdu } = getStatement();
  const isMCQ =
    question.type === "MCQ" && question.options && question.options.length > 0;

  return (
    <div className="pq-card fade-in">
      {/* ✅ UPDATED HEADER INFO */}
      <div className="pq-header">
        <div className="q-meta-left">
          <div className="q-number-badge">{index + 1}</div>
          <span className="pq-type">{question.type}</span>
          <span className="badge bg-secondary">{question.difficulty}</span>
        </div>
        <span className="pq-marks">{question.marks} Marks</span>
      </div>

      {/* Main Statement */}
      <div className={`pq-statement ${isUrdu ? "urdu-text" : ""}`}>{text}</div>

      {/* Options for MCQ */}
      {isMCQ && (
        <div className="pq-options">
          {question.options.map((opt, idx) => (
            <div
              key={opt._id || idx}
              className={`pq-option ${showAnswer && opt.isCorrect ? "correct" : ""}`}
            >
              <span className="opt-letter">
                {String.fromCharCode(65 + idx)}.
              </span>{" "}
              {opt.en || opt.ur}
              {showAnswer && opt.isCorrect && (
                <span className="float-end">✅</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Answer Area for Short/Long */}
      {!isMCQ && showAnswer && (
        <div className="p-3 mb-3 bg-light rounded border text-dark">
          <em>Self-Evaluation:</em> Did you recall the main points of this topic
          correctly? Revise the textbook if needed.
        </div>
      )}

      {/* Action Button */}
      <div className="pq-actions">
        <button
          className="btn-show-ans d-flex align-items-center gap-2"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? <FaEyeSlash /> : <FaEye />}
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>
      </div>
    </div>
  );
};

export default PracticeQuestionCard;
