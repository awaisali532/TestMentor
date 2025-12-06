import React from "react";
import "./QuestionsType.css";
import { FaCheckCircle } from "react-icons/fa";

const questionTypes = [
  "Exercise Questions",
  "Past Papers",
  "Conceptual Questions",
  "Review Questions",
  "Example Questions",
];

const QuestionTypes = () => {
  return (
    <div className="container text-center my-4">
      <h2 className="section-title mb-4">Question Types</h2>
      <div className="d-flex flex-wrap justify-content-center gap-3 question-wrapper">
        {questionTypes.map((type, index) => (
          <div
            className="q-type-card d-flex flex-column align-items-center"
            key={index}
          >
            <FaCheckCircle className="check-icon mb-2" />
            <span className="question-label">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypes;
