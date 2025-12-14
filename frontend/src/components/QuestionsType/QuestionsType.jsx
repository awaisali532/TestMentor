import React from "react";
import "./QuestionsType.css";
import { FaCheckCircle } from "react-icons/fa";

// ✅ Updated list to match Backend Enums
const questionTypes = [
  "Text / Theory",
  "Exercise Questions",
  "Numerical Problems",
  "Review Questions",
  "Conceptual Questions",
  "Example Questions",
];

const QuestionTypes = () => {
  return (
    <section className="questions-section">
      <div className="container">
        {/* Header */}
        <div className="qt-header text-center">
          <h2 className="qt-title">
            Included <span className="highlight-text">Question Types</span>
          </h2>
          <p className="qt-subtitle">
            We cover every type of question to ensure 100% preparation.
          </p>
        </div>

        {/* Grid */}
        <div className="d-flex flex-wrap justify-content-center gap-4 qt-wrapper">
          {questionTypes.map((type, index) => (
            <div className="qt-card-glass" key={index}>
              <FaCheckCircle className="qt-icon" />
              <span className="qt-label">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuestionTypes;
