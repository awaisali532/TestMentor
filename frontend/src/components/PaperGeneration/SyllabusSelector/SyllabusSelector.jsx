import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaChevronDown,
  FaChevronRight,
  FaExclamationCircle,
  FaArrowRight,
  FaCheckDouble,
} from "react-icons/fa"; // ❌ FaSpinner Removed
import "./SyllabusSelector.css";

// ✅ Import Custom TM Loader
import TMLoader from "../../common/TMLoader/TMLoader";

const SyllabusSelector = ({
  selectedClass,
  selectedSubject,
  onSelectionChange,
  onNext,
}) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- 1. FETCH SYLLABUS ---
  useEffect(() => {
    const fetchSyllabus = async () => {
      // ✅ 1 Second Delay Logic
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          params: { className: selectedClass, subjectName: selectedSubject },
        };

        // ✅ Run API + Delay Together
        const [response] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/chapters/filter`, config),
          minDelay,
        ]);

        setChapters(response.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load syllabus.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedClass && selectedSubject) fetchSyllabus();
  }, [selectedClass, selectedSubject]);

  // ... (HELPERS & HANDLERS same rahenge) ...

  const allTopicIds = useMemo(() => {
    return chapters.flatMap((ch) => ch.topics.map((t) => t._id));
  }, [chapters]);

  const isAllSelected =
    allTopicIds.length > 0 && allTopicIds.length === selectedTopicIds.length;

  const updateSelection = (newIds) => {
    setSelectedTopicIds(newIds);
    let label = "Select Syllabus";

    if (newIds.length > 0) {
      if (newIds.length === allTopicIds.length) {
        label = "Full Syllabus";
      } else {
        const involvedChapters = chapters
          .filter((ch) => ch.topics.some((t) => newIds.includes(t._id)))
          .map((ch) => `CH-${ch.chapterNumber}`);
        label = involvedChapters.join(", ");
      }
    }
    onSelectionChange(newIds, label);
  };

  const toggleChapter = (chapId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const handleSelectAll = () => {
    const updated = isAllSelected ? [] : [...allTopicIds];
    updateSelection(updated);
  };

  const handleTopicCheck = (topicId) => {
    let updated;
    if (selectedTopicIds.includes(topicId)) {
      updated = selectedTopicIds.filter((id) => id !== topicId);
    } else {
      updated = [...selectedTopicIds, topicId];
    }
    updateSelection(updated);
  };

  const handleChapterCheck = (chapter) => {
    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const allSelected = chapterTopicIds.every((id) =>
      selectedTopicIds.includes(id)
    );

    let updated;
    if (allSelected) {
      updated = selectedTopicIds.filter((id) => !chapterTopicIds.includes(id));
    } else {
      const newIds = chapterTopicIds.filter(
        (id) => !selectedTopicIds.includes(id)
      );
      updated = [...selectedTopicIds, ...newIds];
    }
    updateSelection(updated);
  };

  const getChapterStatus = (chapter) => {
    if (!chapter.topics || chapter.topics.length === 0)
      return { checked: false, indeterminate: false };
    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const selectedCount = chapterTopicIds.filter((id) =>
      selectedTopicIds.includes(id)
    ).length;

    if (selectedCount === chapter.topics.length)
      return { checked: true, indeterminate: false };
    if (selectedCount > 0) return { checked: false, indeterminate: true };
    return { checked: false, indeterminate: false };
  };

  // --- RENDER ---

  // ✅ NEW LOADER LOGIC
  if (loading) {
    return <TMLoader message={`Loading Syllabus for ${selectedSubject}...`} />;
  }

  if (error)
    return (
      <div className="syl-error">
        <FaExclamationCircle /> {error}
      </div>
    );
  if (chapters.length === 0)
    return <div className="syl-empty">No chapters found.</div>;

  return (
    <div className="syl-wrapper fade-in-up">
      {" "}
      {/* Added Animation */}
      <h3 className="syl-title">Select Topics from {selectedSubject}</h3>
      {/* Select All Bar */}
      <div
        className={`syl-select-all ${isAllSelected ? "active" : ""}`}
        onClick={handleSelectAll}
      >
        <div className="d-flex align-items-center gap-3">
          <input
            type="checkbox"
            className="syl-checkbox"
            checked={isAllSelected}
            readOnly
          />
          <span className="fw-bold">Select Full Syllabus (All Chapters)</span>
        </div>
        <FaCheckDouble className="syl-all-icon" />
      </div>
      <div className="syl-grid">
        {chapters.map((chapter) => {
          const { checked, indeterminate } = getChapterStatus(chapter);
          const isExpanded = expandedChapters[chapter._id];

          return (
            <div
              key={chapter._id}
              className={`syl-card ${isExpanded ? "expanded" : ""}`}
            >
              <div
                className="syl-header"
                onClick={() => toggleChapter(chapter._id)}
              >
                <div className="syl-header-left">
                  <input
                    type="checkbox"
                    className="syl-checkbox"
                    checked={checked}
                    ref={(el) => el && (el.indeterminate = indeterminate)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleChapterCheck(chapter)}
                  />
                  <div className="syl-chap-badge">
                    CH-{chapter.chapterNumber}
                  </div>
                  <span className="syl-chap-name">
                    {chapter.name?.en || chapter.name || "Chapter"}
                  </span>
                </div>
                <span className="syl-icon">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </div>

              <div className={`syl-body ${isExpanded ? "open" : ""}`}>
                {chapter.topics.length > 0 ? (
                  chapter.topics.map((topic) => (
                    <label key={topic._id} className="syl-topic-row">
                      <input
                        type="checkbox"
                        className="syl-topic-cb"
                        checked={selectedTopicIds.includes(topic._id)}
                        onChange={() => handleTopicCheck(topic._id)}
                      />
                      <span className="syl-topic-num">{topic.topicNumber}</span>
                      <span className="syl-topic-text">
                        {topic.name?.en || topic.name || "Topic"}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="syl-no-data">No topics available</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        className={`syl-fab-btn ${
          selectedTopicIds.length === 0 ? "disabled" : ""
        }`}
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
