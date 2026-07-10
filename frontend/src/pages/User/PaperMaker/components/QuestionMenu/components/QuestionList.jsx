import React, { useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual"; // ✅ VIRTUALIZATION IMPORT
import axios from "axios";
import { FaInbox } from "react-icons/fa";
import Loader from "../../../../../../components/ui/Loader";
import QuestionCard from "../components/QuestionCard";
import {
  SUBJECT_RULES,
  DEFAULT_RULE,
} from "../../../../../../config/SubjectFilterRules";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
  const subjectId = paperData.subject?._id || paperData.subject;
  const parentRef = useRef(null); // ✅ Scrolling Container Reference

  // 1. FETCH ONCE
  const fetchQuestions = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      grade: paperData.grade,
      subject: subjectId,
      type: activeTab,
      topics: paperData.topics || [],
    };

    const res = await axios.post(`${BASE_URL}/api/questions/filter`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.sort((a, b) => {
      const topicNumA = a.topics?.[0]?.topicNumber || "0";
      const topicNumB = b.topics?.[0]?.topicNumber || "0";
      return topicNumA.localeCompare(topicNumB, undefined, { numeric: true });
    });
  };

  // 2. CACHING
  const {
    data: allQuestions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["questions", paperData.grade, subjectId, activeTab],
    queryFn: fetchQuestions,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60,
    onSuccess: (data) => {
      if (onDataLoaded) onDataLoaded(data);
    },
  });

  // 3. FAST CLIENT-SIDE FILTERING & TOPIC HEADER LOGIC
  // 3. FAST CLIENT-SIDE FILTERING & TOPIC HEADER LOGIC (WITH DEBUG LOGS 🛠️)
  // 3. FAST CLIENT-SIDE FILTERING & TOPIC HEADER LOGIC
  const processedQuestions = useMemo(() => {
    if (!allQuestions || allQuestions.length === 0) return [];

    let lastTopicId = null;
    const filtered = allQuestions.filter((q) => {
      // A. Difficulty Filter
      if (filters.difficulty?.length > 0) {
        const diffs = filters.difficulty.map((d) =>
          String(d).toUpperCase().trim(),
        );
        const qDiff = String(q.difficulty || "MEDIUM")
          .toUpperCase()
          .trim();
        if (!diffs.includes(qDiff)) return false;
      }

      // B. Chapters Filter
      if (requiredChapters?.length > 0) {
        const qChapterId = String(q.chapter?._id || q.chapter);
        const reqChaps = requiredChapters.map((c) => String(c));
        if (!reqChaps.includes(qChapterId)) return false;
      }

      // C. Categories Filter (Pure & Simple Match - No Strict Rules)
      const activeCategories =
        requiredCategory && requiredCategory !== "ANY"
          ? [requiredCategory]
          : filters.category || [];

      if (activeCategories.length > 0 && !activeCategories.includes("ANY")) {
        let rawQCats = q.category || q.questionCategory;
        if (!rawQCats) return false; // Agar question mein koi tag hi nahi toh drop
        if (!Array.isArray(rawQCats)) rawQCats = [rawQCats];

        // DB categories ko uppercase kar liya taake exact match ho
        const qCats = rawQCats.map((c) => String(c).toUpperCase().trim());

        // Simple check: Agar selected category question ke tags mein hai, toh SHOW karo
        const matchesAnyCategory = activeCategories.every((rawCat) => {
          const cat = String(rawCat).toUpperCase().trim();
          return qCats.includes(cat);
        });

        if (!matchesAnyCategory) return false;
      }

      return true; // Passed all filters!
    });

    // Add header info so Virtualizer handles it correctly
    return filtered.map((q) => {
      const topicObj = q.topics?.[0];
      const topicId = topicObj?._id || "unknown";
      const rawName = topicObj?.name;
      const topicName = rawName
        ? typeof rawName === "object"
          ? `${rawName.en} ${rawName.ur ? `(${rawName.ur})` : ""}`
          : rawName
        : "General Questions";

      const showHeader = topicId !== lastTopicId;
      lastTopicId = topicId;

      return {
        ...q,
        showHeader,
        topicDisplayName: topicObj?.topicNumber
          ? `${topicObj.topicNumber} - ${topicName}`
          : topicName,
      };
    });
  }, [allQuestions, filters, requiredChapters, requiredCategory]);
  // 4. VIRTUALIZATION ENGINE 🚀
  const rowVirtualizer = useVirtualizer({
    count: processedQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Average height of a card
    overscan: 5, // Load 5 extra items above/below for smooth scrolling
  });

  const checkMatch = useCallback((itemInState, targetId) => {
    if (!itemInState || !targetId) return false;
    const target = String(targetId);
    return (
      String(itemInState._id) === target ||
      String(itemInState.questionId?._id || itemInState.questionId) === target
    );
  }, []);

  if (isLoading)
    return <Loader fullScreen={false} text="Loading Questions into Cache..." />;
  if (isError)
    return (
      <div className="p-5 text-red-500 text-center font-bold">
        Failed to load questions.
      </div>
    );

  if (processedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-muted text-base">
        <FaInbox className="text-4xl mb-3 opacity-50" />
        <span>No questions found matching these filters.</span>
      </div>
    );
  }

  return (
    // ✅ FIX: Ab yeh div apni fixed height khud control karega aur Virtualizer ko theek limits dega
    <div
      ref={parentRef}
      className="w-full h-full overflow-y-auto custom-scrollbar px-5 pt-5 pb-25 relative"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const q = processedQuestions[virtualRow.index];
          const isSelected = tempSelected.some((savedQ) =>
            checkMatch(savedQ, q._id),
          );

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: "8px", // Cards ke darmian space
              }}
            >
              {q.showHeader && (
                <div className="bg-[#1e3a8a] text-white text-center font-bold px-4 py-2.5 text-[1.1rem] rounded-t-md mt-4 uppercase tracking-wide">
                  {q.topicDisplayName}
                </div>
              )}
              <QuestionCard
                question={q}
                index={virtualRow.index + 1}
                isSelected={isSelected}
                onToggle={onToggleSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(QuestionList);
