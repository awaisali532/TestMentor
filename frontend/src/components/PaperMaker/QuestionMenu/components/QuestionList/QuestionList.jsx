import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaInbox } from "react-icons/fa";
import QuestionCard from "../QuestionCard/QuestionCard";
import "./QuestionList.css";

const QuestionList = ({
  filters,
  activeTab,
  paperData,
  tempSelected, // Mixed Array (Saved + New)
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

  // ✅ HELPER: Get Real ID for Comparison
  const getRealID = (q) => {
    if (!q) return null;
    if (q.questionId) {
      return typeof q.questionId === "object" ? q.questionId._id : q.questionId;
    }
    return q._id;
  };

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
      {questions.map((q, index) => {
        const topicId = q.topics?.[0]?._id || "unknown";
        const rawName = q.topics?.[0]?.name;

        let topicName = "General Questions";
        if (rawName) {
          if (typeof rawName === "object") {
            topicName = `${rawName.en} ${rawName.ur ? `(${rawName.ur})` : ""}`;
          } else {
            topicName = rawName;
          }
        }

        const showHeader = topicId !== lastTopicId;
        lastTopicId = topicId;

        // ✅ FIXED VISUAL SELECTION
        // List mein jo question hai wo 'q' hai (Live ID)
        // Saved list mein 'savedQ' hai (Reference ID)
        const isSelected = tempSelected.some((savedQ) => {
          return String(getRealID(savedQ)) === String(q._id);
        });

        return (
          <React.Fragment key={q._id}>
            {showHeader && <div className="ql-topic-header">{topicName}</div>}

            <QuestionCard
              question={q}
              index={index + 1}
              isSelected={isSelected} // ✅ Ab ye 100% Green dikhayega
              onToggle={onToggleSelect}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default QuestionList;
