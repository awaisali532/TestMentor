import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaInbox } from "react-icons/fa";
import QuestionCard from "../QuestionCard/QuestionCard";
import TMLoader from "../../../../common/TMLoader/TMLoader";
import "./QuestionList.css";

// Import Config Rules
import {
  SUBJECT_RULES,
  DEFAULT_RULE,
} from "../../../../../config/SubjectFilterRules";

// 🔥 GLOBAL CACHE (Component ke bahar, taake re-render par reset na ho)
const GLOBAL_QUESTIONS_CACHE = {};

const QuestionList = ({
  filters,
  activeTab,
  paperData,
  tempSelected,
  onToggleSelect,
  requiredChapters,
  requiredCategory,
  onDataLoaded,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payload create karo (Memoized)
  const fetchPayload = useMemo(() => {
    const subjectId = paperData.subject?._id || paperData.subject;
    const categoryFilter = Array.isArray(filters.category)
      ? filters.category[0]
      : filters.category;

    const payload = {
      grade: paperData.grade,
      subject: subjectId,
      type: activeTab,
      difficulty: filters.difficulty,
      chapters: [],
      topics: paperData.topics || [],
    };

    if (requiredChapters && requiredChapters.length > 0) {
      payload.chapters = requiredChapters;
    }

    if (requiredCategory && requiredCategory !== "ANY") {
      payload.category = requiredCategory;
    } else if (categoryFilter) {
      payload.category = categoryFilter;
    }

    return payload;
  }, [
    paperData.grade,
    paperData.subject,
    paperData.topics,
    activeTab,
    filters.difficulty,
    filters.category,
    requiredChapters,
    requiredCategory,
  ]);

  useEffect(() => {
    const fetchQuestions = async () => {
      // 1. Generate Unique Key for this Request
      const cacheKey = JSON.stringify(fetchPayload);

      // 🚀 2. CHECK GLOBAL CACHE FIRST
      if (GLOBAL_QUESTIONS_CACHE[cacheKey]) {
        // console.log("🚀 Serving from Cache (No API Call)");
        const cachedData = GLOBAL_QUESTIONS_CACHE[cacheKey];
        setQuestions(cachedData);
        if (onDataLoaded) onDataLoaded(cachedData);
        return; // EXIT FUNCTION, DO NOT SHOW LOADING
      }

      // 3. Agar Cache mein nahi hai, tabhi Loading dikhao aur API call karo
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Identify Subject & Rule Logic...
        const subjectName = paperData.subject?.subjectName || "Physics";
        const subjectConfig = SUBJECT_RULES[subjectName] || {};
        const activeRule = requiredCategory
          ? subjectConfig[requiredCategory] || DEFAULT_RULE
          : null;

        // console.log("📡 Fetching Data from Backend...");
        const res = await axios.post(
          `${BASE_URL}/api/questions/filter`,
          fetchPayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        let fetchedData = res.data;

        // --- FILTER 1: CHAPTER PAIRING ---
        if (requiredChapters && requiredChapters.length > 0) {
          fetchedData = fetchedData.filter((q) => {
            let qChapterId = q.chapter;
            if (typeof qChapterId === "object" && qChapterId !== null)
              qChapterId = qChapterId._id;
            if (!qChapterId && q.topics && q.topics.length > 0) {
              const t = q.topics[0];
              qChapterId =
                typeof t.chapter === "object" ? t.chapter._id : t.chapter;
            }
            return requiredChapters.includes(String(qChapterId));
          });
        }

        // --- FILTER 2: SMART CATEGORY LOGIC ---
        if (requiredCategory && requiredCategory !== "ANY") {
          fetchedData = fetchedData.filter((q) => {
            let qCats = q.category || q.questionCategory;
            if (!qCats) return false;
            if (!Array.isArray(qCats)) qCats = [qCats];

            if (activeRule) {
              if (
                activeRule.excludeTags &&
                activeRule.excludeTags.some((tag) => qCats.includes(tag))
              )
                return false;
              if (activeRule.mustHave && activeRule.mustHave.length > 0) {
                return activeRule.mustHave.some((tag) => qCats.includes(tag));
              }
              if (activeRule.includeTags && activeRule.includeTags.length > 0) {
                if (qCats.includes(requiredCategory)) return true;
                return activeRule.includeTags.some((tag) =>
                  qCats.includes(tag),
                );
              }
            }
            return qCats.includes(requiredCategory);
          });
        }

        // Sorting
        const sortedQuestions = fetchedData.sort((a, b) => {
          const topicNumA = a.topics?.[0]?.topicNumber || "0";
          const topicNumB = b.topics?.[0]?.topicNumber || "0";
          return topicNumA.localeCompare(topicNumB, undefined, {
            numeric: true,
          });
        });

        // 🔥 SAVE TO GLOBAL CACHE
        GLOBAL_QUESTIONS_CACHE[cacheKey] = sortedQuestions;

        setQuestions(sortedQuestions);
        if (onDataLoaded) onDataLoaded(sortedQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fetchPayload) fetchQuestions();
  }, [fetchPayload]); // Only runs if Payload actually changes (Tabs/Filters)

  // Memoized Match Check
  const checkMatch = (itemInState, targetId) => {
    if (!itemInState || !targetId) return false;
    const target = String(targetId);
    if (itemInState._id && String(itemInState._id) === target) return true;
    if (itemInState.questionId && String(itemInState.questionId) === target)
      return true;
    if (
      itemInState.questionId?._id &&
      String(itemInState.questionId._id) === target
    )
      return true;
    return false;
  };

  if (loading) return <TMLoader />;

  if (questions.length === 0)
    return (
      <div className="ql-empty">
        <FaInbox /> No questions found.
        {requiredCategory && requiredCategory !== "ANY" && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              marginTop: "5px",
            }}
          >
            (Filtered: <strong>{requiredCategory}</strong>)
          </p>
        )}
      </div>
    );

  let lastTopicId = null;

  return (
    <div className="ql-container">
      {questions.map((q, index) => {
        const topicObj = q.topics?.[0];
        const topicId = topicObj?._id || "unknown";
        const rawName = topicObj?.name;
        const topicNum = topicObj?.topicNumber || "";

        let topicName = "General Questions";
        if (rawName) {
          const nameStr =
            typeof rawName === "object"
              ? `${rawName.en} ${rawName.ur ? `(${rawName.ur})` : ""}`
              : rawName;
          topicName = topicNum ? `${topicNum} - ${nameStr}` : nameStr;
        }

        const showHeader = topicId !== lastTopicId;
        lastTopicId = topicId;

        const isSelected = tempSelected.some((savedQ) =>
          checkMatch(savedQ, q._id),
        );

        return (
          <React.Fragment key={q._id}>
            {showHeader && <div className="ql-topic-header">{topicName}</div>}
            <QuestionCard
              question={q}
              index={index + 1}
              isSelected={isSelected}
              onToggle={onToggleSelect}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

// React.memo to prevent render if props are exactly the same
export default React.memo(QuestionList);
