import React from "react";
import "./QuestionList.css";

const QuestionList = () => {
  return (
    <div className="qm-list-container">
      <div className="qm-empty-state">
        <p>Select filters to load questions...</p>
      </div>
    </div>
  );
};

export default QuestionList;
