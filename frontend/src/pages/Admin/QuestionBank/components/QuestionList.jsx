import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import QuestionItem from "./QuestionItem";
import {
  HelpCircle,
  CheckSquare,
  Square,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getChapterInfo = (ch) => {
  if (!ch) return { id: "no-ch", num: 9999, label: "General / Unassigned Chapter" };
  if (typeof ch === "string") return { id: ch, num: 9999, label: `Chapter: ${ch.slice(-6)}` };
  const num = parseFloat(ch.chapterNumber) || 9999;
  const prefix = ch.chapterNumber ? `Chapter ${ch.chapterNumber}: ` : "";
  const rawName = ch.name;
  const nameText =
    rawName && typeof rawName === "object"
      ? rawName.en || rawName.ur || "Untitled Chapter"
      : rawName || "Untitled Chapter";
  return {
    id: String(ch._id || ch.id || "no-ch"),
    num,
    label: `${prefix}${nameText}`,
  };
};

// topics is an ARRAY from backend populate("topics", "name topicNumber")
// name is { en, ur }, topicNumber is a string like "1.1"
const getTopicInfo = (topicsArr) => {
  if (!topicsArr) return { id: "no-top", num: 9999, label: "General Questions" };
  const item = Array.isArray(topicsArr) ? topicsArr[0] : topicsArr;
  if (!item) return { id: "no-top", num: 9999, label: "General Questions" };
  if (typeof item === "string") return { id: item, num: 9999, label: `Topic: ${item.slice(-6)}` };
  const num = parseFloat(item.topicNumber) || 9999;
  const prefix = item.topicNumber ? `Topic ${item.topicNumber}: ` : "";
  const rawName = item.name;
  const nameText =
    rawName && typeof rawName === "object"
      ? rawName.en || rawName.ur || "General Questions"
      : rawName || "General Questions";
  return {
    id: String(item._id || item.id || "no-top"),
    num,
    label: `${prefix}${nameText}`,
  };
};

// Type display order inside every topic: MCQ first, then SHORT, then LONG
const TYPE_ORDER = { MCQ: 0, SHORT: 1, LONG: 2 };
const sortByType = (a, b) =>
  (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);

// ─── Memoized QuestionItem wrapper (avoids unnecessary re-renders) ───────────
const MemoQuestionItem = memo(({ question, isSelected, onToggleSelect, onEdit, onDelete }) => (
  <QuestionItem
    question={question}
    isSelected={isSelected}
    onToggleSelect={onToggleSelect}
    onEdit={onEdit}
    onDelete={onDelete}
  />
));

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 40; // items per page — keeps DOM light

// ─── Main Component ──────────────────────────────────────────────────────────
const QuestionList = ({
  questions,
  loading,
  selectedIds,
  selectedChapter,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
}) => {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the question list or chapter changes
  useEffect(() => {
    setPage(1);
  }, [questions, selectedChapter]);

  // ── Pagination slice (applied BEFORE grouping to keep DOM light) ──────────
  const totalPages = Math.ceil((questions?.length || 0) / PAGE_SIZE);
  const pagedQuestions = useMemo(() => {
    if (!questions) return [];
    const start = (page - 1) * PAGE_SIZE;
    return questions.slice(start, start + PAGE_SIZE);
  }, [questions, page]);

  // ── Group paged slice by Chapter → Topic ─────────────────────────────────
  const groupedData = useMemo(() => {
    if (!pagedQuestions.length) return [];
    const isAllChapters = !selectedChapter;

    if (isAllChapters) {
      const chMap = new Map();
      pagedQuestions.forEach((q) => {
        const chInfo = getChapterInfo(q.chapter);
        const topInfo = getTopicInfo(q.topics);

        if (!chMap.has(chInfo.id)) {
          chMap.set(chInfo.id, { info: chInfo, topicsMap: new Map(), totalCount: 0 });
        }
        const chEntry = chMap.get(chInfo.id);
        chEntry.totalCount += 1;

        if (!chEntry.topicsMap.has(topInfo.id)) {
          chEntry.topicsMap.set(topInfo.id, { info: topInfo, items: [] });
        }
        chEntry.topicsMap.get(topInfo.id).items.push(q);
      });

      // Sort items within each topic by MCQ → SHORT → LONG
      chMap.forEach((ch) =>
        ch.topicsMap.forEach((top) => top.items.sort(sortByType))
      );

      return Array.from(chMap.values())
        .sort((a, b) => a.info.num - b.info.num)
        .map((ch) => ({
          ...ch,
          topicsList: Array.from(ch.topicsMap.values()).sort(
            (a, b) => a.info.num - b.info.num
          ),
        }));
    } else {
      // Single chapter — group only by topic
      const topMap = new Map();
      pagedQuestions.forEach((q) => {
        const topInfo = getTopicInfo(q.topics);
        if (!topMap.has(topInfo.id)) {
          topMap.set(topInfo.id, { info: topInfo, items: [] });
        }
        topMap.get(topInfo.id).items.push(q);
      });

      // Sort items within each topic by MCQ → SHORT → LONG
      topMap.forEach((top) => top.items.sort(sortByType));

      return [
        {
          info: { id: "single-ch", label: "" },
          totalCount: pagedQuestions.length,
          topicsList: Array.from(topMap.values()).sort(
            (a, b) => a.info.num - b.info.num
          ),
        },
      ];
    }
  }, [pagedQuestions, selectedChapter]);

  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const handleNext = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Fetching Question Repository from Database...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
        <HelpCircle className="w-12 h-12 mx-auto text-slate-400" />
        <h3 className="text-base font-bold text-main">No questions found</h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Try clearing search filters or add new questions to the repository.
        </p>
      </div>
    );
  }

  const allSelected = questions.length > 0 && selectedIds.length === questions.length;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, questions.length);

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Select All + Pagination status ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-border">
        <button
          onClick={onSelectAll}
          className="flex items-center gap-2 hover:text-main transition-colors font-bold text-slate-700 dark:text-slate-300"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>
            {allSelected ? "Deselect All" : "Select All"} ({questions.length} questions)
          </span>
        </button>

        <span className="text-slate-500 dark:text-slate-400">
          Showing {start}–{end} of {questions.length}
          {!selectedChapter ? " · Chapter-Wise View" : ""}
        </span>
      </div>

      {/* ── Grouped Questions ── */}
      <div className="space-y-8">
        {groupedData.map((chGroup) => (
          <div key={chGroup.info.id} className="space-y-4">
            {/* Chapter Banner — only in All-Chapters mode */}
            {!selectedChapter && chGroup.info.label && (
              <div className="sticky top-0 z-10 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-md flex items-center justify-between border border-emerald-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                    <BookOpen className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-wide text-white">
                      {chGroup.info.label}
                    </h2>
                    <p className="text-[11px] text-emerald-200/80 font-medium">
                      {chGroup.totalCount} {chGroup.totalCount === 1 ? "Question" : "Questions"} on this page
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/20">
                  {chGroup.totalCount}
                </span>
              </div>
            )}

            {/* Topics inside chapter */}
            <div className="space-y-6 pl-1 sm:pl-2">
              {chGroup.topicsList.map((topGroup) => (
                <div key={topGroup.info.id} className="space-y-3">
                  {/* Topic divider — always show if label exists */}
                  {topGroup.info.label && topGroup.info.label !== "General Questions" && (
                    <div className="flex items-center gap-2 pt-2 border-b border-border/60 pb-1.5">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {topGroup.info.label}
                      </span>
                      <span className="ml-1 text-[10px] font-bold text-muted bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {topGroup.items.length}
                      </span>
                    </div>
                  )}

                  {/* Question cards */}
                  <div className="space-y-4">
                    {topGroup.items.map((q) => (
                      <MemoQuestionItem
                        key={q._id}
                        question={q}
                        isSelected={selectedIds.includes(q._id)}
                        onToggleSelect={onToggleSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card text-main hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - page) <= 1
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="text-xs text-muted px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors border ${
                      p === page
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-card border-border text-main hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card text-main hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
