import React from "react";
import parse from "html-react-parser"; // HTML render ke liye
import "./QuestionList.css";

const QuestionList = ({ questions, selectedIds, onToggle }) => {
  // Group by Topic logic
  const groupedQuestions = questions.reduce((acc, question) => {
    const chapterName =
      question.chapter?.name?.en || question.chapter?.name || "General";
    if (!acc[chapterName]) acc[chapterName] = [];
    acc[chapterName].push(question);
    return acc;
  }, {});

  return (
    <div className="q-list-wrapper">
      {Object.keys(groupedQuestions).map((chapter, index) => (
        <div key={index} className="chapter-group">
          {/* SOLID TOPIC BAR */}
          <div className="chapter-header">
            <span>{chapter}</span>
            <span className="q-count-badge">
              {groupedQuestions[chapter].length} Qs
            </span>
          </div>

          {/* QUESTIONS LIST */}
          <div className="chapter-questions">
            {groupedQuestions[chapter].map((q) => {
              const isSelected = selectedIds.includes(q._id);
              return (
                <div
                  key={q._id}
                  className={`question-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onToggle(q._id)}
                >
                  <div className="q-checkbox">
                    <div
                      className={`custom-check ${isSelected ? "checked" : ""}`}
                    ></div>
                  </div>

                  <div className="q-content">
                    <div className="q-text">{parse(q.questionText || "")}</div>

                    <div className="q-meta">
                      <div className="q-tags">
                        <span className={`tag ${q.difficulty?.toLowerCase()}`}>
                          {q.difficulty}
                        </span>
                        {q.isConceptual && (
                          <span className="tag conceptual">Conceptual</span>
                        )}
                      </div>
                      {/* Marks show kar sakte hain */}
                      <span className="q-marks">({q.marks} Marks)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
