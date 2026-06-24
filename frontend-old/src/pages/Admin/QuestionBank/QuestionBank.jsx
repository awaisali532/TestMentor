import React, { useState } from "react";
import { FaLayerGroup } from "react-icons/fa";
import "./QuestionBank.css";

// 👇 COMPONENTS IMPORT
import FilterBar from "../../../components/Admin/QuestionBank/FilterBar/FilterBar";
import TopicManager from "../../../components/Admin/QuestionBank/TopicManager/TopicManager";
import QuestionManager from "../../../components/Admin/QuestionBank/QuestionManager/QuestionManager";

const QuestionBank = () => {
  // ✅ 1. State me subjectName add karein
  const [filters, setFilters] = useState({
    classLevel: "",
    subjectId: "",
    subjectName: "", // New Field
    chapterId: "",
  });
  const [activeTab, setActiveTab] = useState("topics");

  // ✅ 2. Handler update karein taake ye Name bhi receive kare
  const handleFilterChange = (
    classLevel,
    subjectId,
    chapterId,
    subjectName
  ) => {
    setFilters({ classLevel, subjectId, chapterId, subjectName });
    if (chapterId) setActiveTab("topics");
  };

  return (
    <div className="qb-wrapper p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-main m-0 d-flex align-items-center gap-2">
            📚 Question <span className="highlight-text">Bank</span>
          </h3>
          <p className="text-muted small m-0">
            Manage topics and questions hierarchically.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Main Content Area */}
      {filters.chapterId ? (
        <div className="qb-content">
          {/* Tabs */}
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

          {/* Dynamic Components */}
          <div className="p-4">
            {activeTab === "topics" && (
              <TopicManager
                chapterId={filters.chapterId}
                subjectName={filters.subjectName} // ✅ Ab ye Sahi variable pass kar raha hai
              />
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
        /* Empty State */
        <div className="qb-empty-state">
          <div className="empty-icon-box">
            <FaLayerGroup />
          </div>
          <h4>Select a Chapter to Begin</h4>
          <p>
            Please select a Class, Subject, and Chapter from the filters above.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
