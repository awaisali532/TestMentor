import React, { useState } from "react";
import "./QuestionBank.css";

// 👇 COMPONENTS IMPORT
import FilterBar from "../../../components/Admin/QuestionBank/FilterBar/FilterBar";

// ⚠️ ABHI INKO COMMENT KAR DO (Kyunke ye files abhi nahi banin)
import TopicManager from "../../../components/Admin/QuestionBank/TopicManager/TopicManager";
import QuestionManager from "../../../components/Admin/QuestionBank/QuestionManager/QuestionManager";
// import QuestionManager from '../../components/Admin/QuestionBank/QuestionManager/QuestionManager';

const QuestionBank = () => {
  const [filters, setFilters] = useState({
    classLevel: "",
    subjectId: "",
    chapterId: "",
  });
  const [activeTab, setActiveTab] = useState("topics");

  const handleFilterChange = (classLevel, subjectId, chapterId) => {
    setFilters({ classLevel, subjectId, chapterId });
    if (chapterId) setActiveTab("topics");
  };

  return (
    <div className="qb-wrapper p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">📚 Question Bank</h3>
      </div>

      {/* Filter Bar chalega kyunke ye ban chuka hai */}
      <FilterBar onFilterChange={handleFilterChange} />

      {filters.chapterId ? (
        <div className="qb-content">
          <div className="qb-tabs">
            <button
              className={`qb-tab-btn ${activeTab === "topics" ? "active" : ""}`}
              onClick={() => setActiveTab("topics")}
            >
              1. Manage Topics
            </button>
            <button
              className={`qb-tab-btn ${
                activeTab === "questions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("questions")}
            >
              2. Manage Questions
            </button>
          </div>

          <div className="p-4">
            {/* ⚠️ YAHAN BHI COMMENT KAR DO */}
            {activeTab === "topics" && (
              <TopicManager chapterId={filters.chapterId} />
            )}

            {activeTab === "questions" && (
              <QuestionManager
                chapterId={filters.chapterId}
                subjectId={filters.subjectId}
                classLevel={filters.classLevel}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="qb-empty-state">
          <h4>Select a Chapter to Begin</h4>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
