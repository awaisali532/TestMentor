import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaChevronDown,
  FaChevronRight,
  FaExclamationCircle,
  FaArrowRight,
  FaCheckDouble,
} from "react-icons/fa";
import Loader from "../../../../components/ui/Loader";

const SyllabusSelector = ({
  selectedClass,
  selectedSubject,
  onSelectionChange,
  selectedTopics,
  onNext,
}) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedTopicIds, setSelectedTopicIds] = useState(
    selectedTopics || [],
  );

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (selectedTopics) {
      setSelectedTopicIds(selectedTopics);
    }
  }, [selectedTopics]);

  useEffect(() => {
    const fetchSyllabus = async () => {
      const cacheKey = `tm_cache_chapters_${selectedClass}_${selectedSubject}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        setChapters(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          params: { className: selectedClass, subjectName: selectedSubject },
        };
        const [response] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/chapters/filter`, config),
          minDelay,
        ]);
        setChapters(response.data);
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load syllabus.");
      } finally {
        setLoading(false);
      }
    };
    if (selectedClass && selectedSubject) fetchSyllabus();
  }, [selectedClass, selectedSubject]);

  const allTopicIds = useMemo(
    () => chapters.flatMap((ch) => ch.topics.map((t) => t._id)),
    [chapters],
  );
  const isAllSelected =
    allTopicIds.length > 0 && allTopicIds.length === selectedTopicIds.length;

  // ✅ SMART HALF-BOOK LOGIC ADDED HERE
  const updateSelection = (newIds) => {
    setSelectedTopicIds(newIds);
    let label = "Select Syllabus";
    let type = "CHAPTERS";

    if (newIds.length > 0) {
      const totalChaptersCount = chapters.length;

      // Ginte hain ke user ne kitne chapters select kiye (jin mein kam az kam 1 topic select ho)
      const selectedChaptersCount = chapters.filter((ch) =>
        ch.topics.some((t) => newIds.includes(t._id)),
      ).length;

      // 1. Full Book Check
      if (
        selectedChaptersCount === totalChaptersCount ||
        newIds.length === allTopicIds.length
      ) {
        label =
          newIds.length === allTopicIds.length
            ? "Full Syllabus"
            : "Full Syllabus (Custom)";
        type = "FULL_BOOK";
      }
      // 2. Half Book Check (Ceil Math lagaya gaya hai, e.g. 9/2 = 5)[cite: 10]
      else if (selectedChaptersCount === Math.ceil(totalChaptersCount / 2)) {
        label = "Half Book";
        type = "HALF_BOOK";
      }
      // 3. Chapter Wise Check
      else {
        const involvedChapters = chapters
          .filter((ch) => ch.topics.some((t) => newIds.includes(t._id)))
          .map((ch) => `CH-${ch.chapterNumber}`);
        label = involvedChapters.join(", ");
        type = "CHAPTERS";
      }
    }

    // Parent element ko naya Type bhej rahe hain
    onSelectionChange(newIds, label, type);
  };

  const toggleChapter = (chapId) =>
    setExpandedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  const handleSelectAll = () =>
    updateSelection(isAllSelected ? [] : [...allTopicIds]);

  const handleTopicCheck = (topicId) => {
    updateSelection(
      selectedTopicIds.includes(topicId)
        ? selectedTopicIds.filter((id) => id !== topicId)
        : [...selectedTopicIds, topicId],
    );
  };

  const handleChapterCheck = (chapter) => {
    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const allSelected = chapterTopicIds.every((id) =>
      selectedTopicIds.includes(id),
    );
    updateSelection(
      allSelected
        ? selectedTopicIds.filter((id) => !chapterTopicIds.includes(id))
        : [
            ...selectedTopicIds,
            ...chapterTopicIds.filter((id) => !selectedTopicIds.includes(id)),
          ],
    );
  };

  const getChapterStatus = (chapter) => {
    if (!chapter.topics || chapter.topics.length === 0)
      return { checked: false, indeterminate: false };
    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const selectedCount = chapterTopicIds.filter((id) =>
      selectedTopicIds.includes(id),
    ).length;
    if (selectedCount === chapter.topics.length)
      return { checked: true, indeterminate: false };
    if (selectedCount > 0) return { checked: false, indeterminate: true };
    return { checked: false, indeterminate: false };
  };

  if (loading)
    return (
      <Loader
        fullScreen={false}
        text={`Loading Syllabus for ${selectedSubject}...`}
      />
    );
  if (error)
    return (
      <div className="text-center p-10 flex flex-col items-center text-red-500">
        <FaExclamationCircle className="text-4xl mb-3" />{" "}
        <p className="font-bold">{error}</p>
      </div>
    );
  if (chapters.length === 0)
    return (
      <div className="text-center p-12 text-muted">No chapters found.</div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 animate-fade-in-up">
      <h3 className="text-center text-3xl font-extrabold text-main mb-8">
        Select Topics from {selectedSubject}
      </h3>

      <div
        className={`bg-card border-2 p-4 rounded-xl mb-8 flex justify-between items-center cursor-pointer transition-all duration-300 ${isAllSelected ? "border-accent-1 bg-accent-1/5" : "border-border hover:border-accent-1 hover:shadow-md"}`}
        onClick={handleSelectAll}
      >
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="w-5 h-5 accent-accent-1 cursor-pointer"
            checked={isAllSelected}
            readOnly
          />
          <span className="font-bold text-main text-lg">
            Select Full Syllabus (All Chapters)
          </span>
        </div>
        <FaCheckDouble
          className={`text-xl transition-opacity ${isAllSelected ? "text-accent-1 opacity-100" : "text-muted opacity-30"}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {chapters.map((chapter) => {
          const { checked, indeterminate } = getChapterStatus(chapter);
          const isExpanded = expandedChapters[chapter._id];

          return (
            <div
              key={chapter._id}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-accent-1 transition-all duration-300"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer select-none"
                onClick={() => toggleChapter(chapter._id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-accent-1 cursor-pointer"
                    checked={checked}
                    ref={(el) => el && (el.indeterminate = indeterminate)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleChapterCheck(chapter)}
                  />
                  <span className="bg-accent-1/10 text-accent-1 text-xs font-extrabold px-2.5 py-1 rounded-md whitespace-nowrap">
                    CH-{chapter.chapterNumber}
                  </span>
                  <span className="font-bold text-main text-base truncate">
                    {chapter.name?.en || chapter.name || "Chapter"}
                  </span>
                </div>
                <span
                  className={`text-muted transition-transform duration-300 ${isExpanded ? "rotate-180 text-accent-1" : ""}`}
                >
                  <FaChevronDown />
                </span>
              </div>

              <div
                className={`bg-pill-bg border-t border-transparent transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-125 border-border overflow-y-auto" : "max-h-0"}`}
              >
                {chapter.topics.length > 0 ? (
                  chapter.topics.map((topic) => (
                    <label
                      key={topic._id}
                      className="flex items-center p-3 pl-12 border-b border-border last:border-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-accent-1 mr-4 cursor-pointer"
                        checked={selectedTopicIds.includes(topic._id)}
                        onChange={() => handleTopicCheck(topic._id)}
                      />
                      <span className="font-mono text-muted font-bold text-sm mr-3">
                        {topic.topicNumber}
                      </span>
                      <span className="text-main text-sm font-medium">
                        {topic.name?.en || topic.name || "Topic"}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted italic">
                    No topics available
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 z-50 ${selectedTopicIds.length === 0 ? "bg-gray-400 text-white opacity-50 cursor-not-allowed scale-90" : "bg-accent-1 text-white hover:scale-110 hover:-rotate-12 hover:bg-accent-2 cursor-pointer shadow-accent-1/50"}`}
        onClick={onNext}
        disabled={selectedTopicIds.length === 0}
        title="Next Step"
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

export default SyllabusSelector;
