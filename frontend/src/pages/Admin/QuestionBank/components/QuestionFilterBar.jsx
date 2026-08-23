import React, { useEffect, useState } from "react";
import axios from "axios";
import { Filter, X, Search, Loader2, Star } from "lucide-react";

const QuestionFilterBar = ({
  allSubjects,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedChapter,
  setSelectedChapter,
  selectedTopic,
  setSelectedTopic,
  selectedType,
  setSelectedType,
  selectedCategoryFilter = [],
  setSelectedCategoryFilter,
  searchQuery,
  setSearchQuery,
  onResetFilters,
}) => {
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const classList = ["9th", "10th", "11th", "12th"];

  // Subject Usage Counter for Popular Subjects Ranking
  const recordSubjectClick = (subId) => {
    if (!subId) return;
    try {
      const clicks = JSON.parse(
        localStorage.getItem("qb_subject_clicks") || "{}"
      );
      clicks[subId] = (clicks[subId] || 0) + 1;
      localStorage.setItem("qb_subject_clicks", JSON.stringify(clicks));
    } catch (e) {
      console.warn("Error storing subject click count", e);
    }
  };

  // Filter & Sort Subjects (Class Filtered + Popular First)
  const availableSubjects = React.useMemo(() => {
    const rawList = selectedClass
      ? allSubjects.filter(
          (s) =>
            s.className?.toLowerCase().trim() ===
            selectedClass.toLowerCase().trim()
        )
      : allSubjects;

    try {
      const clicks = JSON.parse(
        localStorage.getItem("qb_subject_clicks") || "{}"
      );
      return [...rawList].sort((a, b) => {
        const countA = clicks[a._id] || 0;
        const countB = clicks[b._id] || 0;
        return countB - countA;
      });
    } catch (e) {
      return rawList;
    }
  }, [allSubjects, selectedClass]);

  // Fetch Chapters when Subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setTopics([]);
      return;
    }

    const fetchChapters = async () => {
      try {
        setLoadingChapters(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/chapters/subject/${selectedSubject}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.chapters || [];
        setChapters(list);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setChapters([]);
      } finally {
        setLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedSubject, API_URL]);

  // Fetch Subject-Specific Categories when Subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setAvailableCategories([]);
      return;
    }

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/questions/categories?subjectId=${selectedSubject}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAvailableCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Error fetching filter categories:", err);
      }
    };

    fetchCategories();
  }, [selectedSubject, API_URL]);

  // Fetch Topics when Chapter changes
  useEffect(() => {
    if (!selectedChapter) {
      setTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        setLoadingTopics(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/topics/chapter/${selectedChapter}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.topics || [];
        setTopics(list);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [selectedChapter, API_URL]);

  const types = [
    { label: "All Types", value: "" },
    { label: "MCQs", value: "MCQ" },
    { label: "Short Qs", value: "SHORT" },
    { label: "Long Qs", value: "LONG" },
  ];

  const hasActiveFilters =
    selectedClass ||
    selectedSubject ||
    selectedChapter ||
    selectedTopic ||
    selectedType ||
    searchQuery;

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-main flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Select Class & Subject to Load Questions</span>
        </h2>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Cascading Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Class / Grade */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Step 1: Select Class *
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject("");
              setSelectedChapter("");
              setSelectedTopic("");
            }}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
          >
            <option value="">-- Choose Class --</option>
            {classList.map((c, i) => (
              <option key={i} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Subject (Popular Sorted + Class Filtered) */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 flex items-center justify-between">
            <span>Step 2: Select Subject *</span>
            {selectedClass && (
              <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                ({availableSubjects.length} available)
              </span>
            )}
          </label>
          <select
            value={selectedSubject}
            disabled={!selectedClass}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSubject(val);
              recordSubjectClick(val);
              setSelectedChapter("");
              setSelectedTopic("");
            }}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <option value="">
              {!selectedClass
                ? "-- Select Class First --"
                : availableSubjects.length === 0
                ? "No Subjects in this Class"
                : "-- Choose Subject --"}
            </option>
            {availableSubjects.map((s, i) => (
              <option key={i} value={s._id}>
                {i === 0 ? "⭐ " : ""}
                {s.subjectName} ({s.className})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Chapter (In-Memory Filter with Loading State) */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 flex items-center justify-between">
            <span>Chapter Filter</span>
            {loadingChapters && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            )}
          </label>
          <select
            value={selectedChapter}
            disabled={!selectedSubject || loadingChapters}
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              setSelectedTopic("");
            }}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <option value="">
              {loadingChapters
                ? "Fetching Chapters..."
                : chapters.length === 0 && selectedSubject
                ? "No Chapters Found"
                : "All Chapters"}
            </option>
            {chapters.map((ch, i) => {
              const nameText =
                typeof ch.name === "object"
                  ? ch.name?.en || ch.name?.ur
                  : typeof ch.name === "string"
                  ? ch.name
                  : ch.title?.en || ch.title?.ur || "";

              return (
                <option key={i} value={ch._id}>
                  Ch {ch.chapterNumber}: {nameText}
                </option>
              );
            })}
          </select>
        </div>

        {/* 4. Topic (In-Memory Filter with Loading State) */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 flex items-center justify-between">
            <span>Topic Filter</span>
            {loadingTopics && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            )}
          </label>
          <select
            value={selectedTopic}
            disabled={!selectedChapter || loadingTopics}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <option value="">
              {loadingTopics
                ? "Fetching Topics..."
                : topics.length === 0 && selectedChapter
                ? "No Topics Found"
                : "All Topics"}
            </option>
            {topics.map((t, i) => {
              const topicNameText =
                typeof t.name === "object"
                  ? t.name?.en || t.name?.ur
                  : typeof t.name === "string"
                  ? t.name
                  : t.title?.en || t.title?.ur || "";

              return (
                <option key={i} value={t._id}>
                  {t.topicNumber ? `${t.topicNumber}: ` : ""}
                  {topicNameText}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Type Selector Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/50">
        {/* Question Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedType === t.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Instant search in loaded questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Multi-Select Pills (If Available for Selected Subject) */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/40 pb-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider shrink-0 mr-1">
            Category Filter:
          </span>
          <button
            onClick={() => setSelectedCategoryFilter && setSelectedCategoryFilter([])}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
              selectedCategoryFilter.length === 0
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Categories
          </button>
          {availableCategories.map((cat) => {
            const isSelected = selectedCategoryFilter.includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => {
                  if (!setSelectedCategoryFilter) return;
                  if (isSelected) {
                    setSelectedCategoryFilter(
                      selectedCategoryFilter.filter((v) => v !== cat.value)
                    );
                  } else {
                    setSelectedCategoryFilter([
                      ...selectedCategoryFilter,
                      cat.value,
                    ]);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isSelected && "✓ "}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionFilterBar;
