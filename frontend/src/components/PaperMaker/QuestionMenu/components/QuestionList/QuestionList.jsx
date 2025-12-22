import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaInbox } from "react-icons/fa";
import QuestionCard from "../QuestionCard/QuestionCard";
import "./QuestionList.css";

const QuestionList = ({
  filters,
  activeTab,
  paperData,
  tempSelected,
  onToggleSelect,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/questions/filter`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            grade: paperData.grade,
            subject: paperData.subject,
            topics: paperData.topics,
            type: activeTab,
            category: filters.category,
            difficulty: filters.difficulty,
          },
        });
        setQuestions(res.data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (paperData && activeTab) fetchQuestions();
  }, [paperData, activeTab, filters]);

  if (loading)
    return (
      <div className="ql-loading">
        <FaSpinner className="spin" /> Loading Questions...
      </div>
    );
  if (questions.length === 0)
    return (
      <div className="ql-empty">
        <FaInbox /> No questions found.
      </div>
    );

  let lastTopicId = null;

  return (
    <div className="ql-container">
      {questions.map((q) => {
        const topicId = q.topics?.[0]?._id || "unknown";
        const rawName = q.topics?.[0]?.name;

        // ✅ Safely extract English and Urdu Topic Names
        let topicEn = "General Questions";
        let topicUr = "";

        if (rawName) {
          if (typeof rawName === "object") {
            topicEn = rawName.en || "General Questions";
            topicUr = rawName.ur || "";
          } else {
            topicEn = rawName;
          }
        }

        const showHeader = topicId !== lastTopicId;
        lastTopicId = topicId;

        const isSelected = tempSelected.some((sel) => sel._id === q._id);

        return (
          <React.Fragment key={q._id}>
            {/* ✅ UPDATED TOPIC HEADER (Split View) */}
            {showHeader && (
              <div className="ql-topic-header">
                <span className="topic-en">{topicEn}</span>
                {topicUr && (
                  <span className="topic-ur" dir="rtl">
                    {topicUr}
                  </span>
                )}
              </div>
            )}

            <QuestionCard
              question={q}
              isSelected={isSelected}
              onToggle={onToggleSelect}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default QuestionList;
