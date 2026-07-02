import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { FaInbox } from "react-icons/fa";
import QuestionCard from "../components/QuestionCard";
import Loader from "../../../../../../components/ui/Loader";
import {
  SUBJECT_RULES,
  DEFAULT_RULE,
} from "../../../../../../config/SubjectFilterRules";

// 🔥 ULTRA-FAST RAM CACHE (Prevents JSON.parse lag on every menu open)
const IN_MEMORY_CACHE = {};

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
      chapters:
        requiredChapters && requiredChapters.length > 0 ? requiredChapters : [],
      topics: paperData.topics || [],
    };

    if (requiredCategory && requiredCategory !== "ANY")
      payload.category = requiredCategory;
    else if (categoryFilter) payload.category = categoryFilter;

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
      const cacheKey = `tm_qcache_${btoa(JSON.stringify(fetchPayload))}`;

      // 1. Check RAM CACHE FIRST (0ms Load Time)
      if (IN_MEMORY_CACHE[cacheKey]) {
        setQuestions(IN_MEMORY_CACHE[cacheKey]);
        if (onDataLoaded) onDataLoaded(IN_MEMORY_CACHE[cacheKey]);
        return;
      }

      // 2. Check SessionStorage
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        IN_MEMORY_CACHE[cacheKey] = parsedData; // Save to RAM for next time
        setQuestions(parsedData);
        if (onDataLoaded) onDataLoaded(parsedData);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const subjectName = paperData.subject?.subjectName || "Physics";
        const subjectConfig = SUBJECT_RULES[subjectName] || {};
        const activeRule = requiredCategory
          ? subjectConfig[requiredCategory] || DEFAULT_RULE
          : null;

        const res = await axios.post(
          `${BASE_URL}/api/questions/filter`,
          fetchPayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        let fetchedData = res.data;

        if (requiredCategory && requiredCategory !== "ANY") {
          fetchedData = fetchedData.filter((q) => {
            let qCats = q.category || q.questionCategory;
            if (!qCats) return false;
            if (!Array.isArray(qCats)) qCats = [qCats];

            if (activeRule) {
              if (activeRule.excludeTags?.some((tag) => qCats.includes(tag)))
                return false;
              if (activeRule.mustHave?.length > 0)
                return activeRule.mustHave.some((tag) => qCats.includes(tag));
              if (activeRule.includeTags?.length > 0) {
                if (qCats.includes(requiredCategory)) return true;
                return activeRule.includeTags.some((tag) =>
                  qCats.includes(tag),
                );
              }
            }
            return qCats.includes(requiredCategory);
          });
        }

        const sortedQuestions = fetchedData.sort((a, b) => {
          const topicNumA = a.topics?.[0]?.topicNumber || "0";
          const topicNumB = b.topics?.[0]?.topicNumber || "0";
          return topicNumA.localeCompare(topicNumB, undefined, {
            numeric: true,
          });
        });

        // 3. Save to Both RAM & Session Storage
        IN_MEMORY_CACHE[cacheKey] = sortedQuestions;
        sessionStorage.setItem(cacheKey, JSON.stringify(sortedQuestions));

        setQuestions(sortedQuestions);
        if (onDataLoaded) onDataLoaded(sortedQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fetchPayload) fetchQuestions();
  }, [fetchPayload, onDataLoaded]);

  const checkMatch = useCallback((itemInState, targetId) => {
    if (!itemInState || !targetId) return false;
    const target = String(targetId);
    if (String(itemInState._id) === target) return true;
    if (
      String(itemInState.questionId?._id || itemInState.questionId) === target
    )
      return true;
    return false;
  }, []);

  if (loading) return <Loader fullScreen={false} text="Loading Questions..." />;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-muted text-base">
        <FaInbox className="text-4xl mb-3 opacity-50" />
        <span>No questions found.</span>
        {requiredCategory && requiredCategory !== "ANY" && (
          <p className="text-xs text-muted/70 mt-2">
            (Filtered: <strong>{requiredCategory}</strong>)
          </p>
        )}
      </div>
    );
  }

  let lastTopicId = null;

  return (
    <div className="flex flex-col w-full">
      {questions.map((q, index) => {
        const topicObj = q.topics?.[0];
        const topicId = topicObj?._id || "unknown";
        const rawName = topicObj?.name;
        const topicName = rawName
          ? typeof rawName === "object"
            ? `${rawName.en} ${rawName.ur ? `(${rawName.ur})` : ""}`
            : rawName
          : "General Questions";
        const displayName = topicObj?.topicNumber
          ? `${topicObj.topicNumber} - ${topicName}`
          : topicName;

        const showHeader = topicId !== lastTopicId;
        lastTopicId = topicId;
        const isSelected = tempSelected.some((savedQ) =>
          checkMatch(savedQ, q._id),
        );

        return (
          <React.Fragment key={q._id}>
            {showHeader && (
              <div className="bg-[#1e3a8a] text-white text-center font-bold px-4 py-2.5 text-[1.1rem] rounded-t-md mt-4 uppercase tracking-wide">
                {displayName}
              </div>
            )}
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

export default React.memo(QuestionList);
