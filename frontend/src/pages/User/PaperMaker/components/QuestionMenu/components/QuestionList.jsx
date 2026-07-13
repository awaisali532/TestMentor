import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import { FaInbox } from "react-icons/fa";
import Loader from "../../../../../../components/ui/Loader";
import QuestionCard from "../components/QuestionCard";

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
  const parentRef = useRef(null);

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

  const {
    data: allQuestions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["questions", paperData.grade, subjectId, activeTab],
    queryFn: fetchQuestions,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60,
  });

  const processedQuestions = useMemo(() => {
    if (!allQuestions || allQuestions.length === 0) return [];
    let lastTopicId = null;

    // 1. FILTERING LOGIC
    const filtered = allQuestions.filter((q) => {
      if (filters.difficulty?.length > 0) {
        const diffs = filters.difficulty.map((d) =>
          String(d).toUpperCase().trim(),
        );
        const qDiff = String(q.difficulty || "MEDIUM")
          .toUpperCase()
          .trim();
        if (!diffs.includes(qDiff)) return false;
      }

      if (requiredChapters?.length > 0) {
        const qChapterId = String(q.chapter?._id || q.chapter);
        const reqChaps = requiredChapters.map((c) => String(c));
        if (!reqChaps.includes(qChapterId)) return false;
      }

      const activeCategories =
        requiredCategory && requiredCategory !== "ANY"
          ? [requiredCategory]
          : filters.category || [];

      if (activeCategories.length > 0 && !activeCategories.includes("ANY")) {
        let rawQCats = q.category || q.questionCategory;
        if (!rawQCats) return false;
        if (!Array.isArray(rawQCats)) rawQCats = [rawQCats];
        const qCats = rawQCats.map((c) => String(c).toUpperCase().trim());
        const matchesAnyCategory = activeCategories.every((rawCat) => {
          const cat = String(rawCat).toUpperCase().trim();
          return qCats.includes(cat);
        });
        if (!matchesAnyCategory) return false;
      }

      if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        const searchWords = filters.searchTerm
          .toLowerCase()
          .trim()
          .split(/\s+/);
        const enText = q.statement?.en?.toLowerCase() || "";
        const urText = q.statement?.ur || "";

        const enMatch = searchWords.every((word) => {
          try {
            return new RegExp(`\\b${word}`, "i").test(enText);
          } catch (e) {
            return enText.includes(word);
          }
        });

        const urMatch = searchWords.every((word) => urText.includes(word));
        if (!enMatch && !urMatch) return false;
      }

      return true;
    });

    // 2. MAPPING & SMART SORTING LOGIC
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

      // ✅ SMART CATEGORY PRIORITY ALGORITHM
      let prioritizedCategories = q.category || q.questionCategory || [];
      if (!Array.isArray(prioritizedCategories)) {
        prioritizedCategories = [prioritizedCategories];
      }

      const activeFilters = filters.category || [];
      if (activeFilters.length > 0 && !activeFilters.includes("ANY")) {
        const upperFilters = activeFilters.map((f) =>
          String(f).toUpperCase().trim(),
        );

        // Sort categories based on their index in the activeFilters array
        prioritizedCategories = [...prioritizedCategories].sort((a, b) => {
          const valA = String(a).toUpperCase().trim();
          const valB = String(b).toUpperCase().trim();
          const idxA = upperFilters.indexOf(valA);
          const idxB = upperFilters.indexOf(valB);

          // Agar dono selected filter hain toh unki tarteeb dekho
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          // Agar sirf A filter mein hai toh usay uper le jao
          if (idxA !== -1) return -1;
          // Agar sirf B filter mein hai toh usay uper le jao
          if (idxB !== -1) return 1;
          // Warna dono ko jahan hain wahein rehne do
          return 0;
        });
      }

      return {
        ...q,
        category: prioritizedCategories, // Updated for priority
        questionCategory: prioritizedCategories, // Updated for priority (handling both keys)
        showHeader,
        topicDisplayName: topicObj?.topicNumber
          ? `${topicObj.topicNumber} - ${topicName}`
          : topicName,
      };
    });
  }, [allQuestions, filters, requiredChapters, requiredCategory]);

  useEffect(() => {
    if (onDataLoaded) {
      onDataLoaded(processedQuestions);
    }
  }, [processedQuestions, onDataLoaded]);

  const rowVirtualizer = useVirtualizer({
    count: processedQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
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
    return <Loader fullScreen={false} text="Loading Questions..." />;
  if (isError)
    return (
      <div className="p-5 text-red-500 text-center font-bold">
        Failed to load questions.
      </div>
    );
  if (processedQuestions.length === 0)
    return (
      <div className="p-10 text-muted text-center mt-10">
        <FaInbox className="text-4xl mx-auto mb-3 opacity-50" />
        {filters.searchTerm
          ? "No questions match your search."
          : "No questions found."}
      </div>
    );

  return (
    <div
      ref={parentRef}
      className="w-full h-[55vh] overflow-y-auto custom-scrollbar px-6 pt-2 bg-bg-body"
    >
      <div
        className="w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
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
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {q.showHeader && (
                <div className="bg-[#1e3a8a] text-white text-center font-bold px-4 py-2.5 text-[1.1rem] rounded-md mb-3 mt-1 uppercase tracking-wide">
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
