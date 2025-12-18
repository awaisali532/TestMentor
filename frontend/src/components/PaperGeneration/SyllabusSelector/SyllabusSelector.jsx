import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChevronDown,
  FaChevronRight,
  FaSpinner,
  FaExclamationCircle,
  FaArrowRight,
} from "react-icons/fa";
import "./SyllabusSelector.css";

const SyllabusSelector = ({
  selectedClass,
  selectedSubject,
  onSelectionChange,
  onNext,
}) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded/Collapsed State
  const [expandedChapters, setExpandedChapters] = useState({});

  // Selection State
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  // API Base URL
  const API_BASE_URL = "http://localhost:5000";

  // --- 1. FETCH SYLLABUS ---
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ FIX: Aapke UserContext ke mutabiq token 'token' key mein hai
        const token = localStorage.getItem("token");

        // Config with Headers
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          params: {
            className: selectedClass,
            subjectName: selectedSubject,
          },
        };

        const response = await axios.get(
          `${API_BASE_URL}/api/chapters/filter`,
          config
        );

        setChapters(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        if (err.response && err.response.status === 401) {
          setError("Session expired or Unauthorized. Please Login.");
        } else {
          setError("Failed to load syllabus.");
        }
        setLoading(false);
      }
    };

    if (selectedClass && selectedSubject) {
      fetchSyllabus();
    }
  }, [selectedClass, selectedSubject]);

  // --- 2. HANDLERS ---

  const toggleChapter = (chapId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapId]: !prev[chapId],
    }));
  };

  const handleTopicCheck = (topicId) => {
    setSelectedTopicIds((prev) => {
      let updated;
      if (prev.includes(topicId)) {
        updated = prev.filter((id) => id !== topicId);
      } else {
        updated = [...prev, topicId];
      }
      onSelectionChange(updated);
      return updated;
    });
  };

  const handleChapterCheck = (chapter) => {
    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const allSelected = chapterTopicIds.every((id) =>
      selectedTopicIds.includes(id)
    );

    setSelectedTopicIds((prev) => {
      let updated;
      if (allSelected) {
        updated = prev.filter((id) => !chapterTopicIds.includes(id));
      } else {
        const newIds = chapterTopicIds.filter((id) => !prev.includes(id));
        updated = [...prev, ...newIds];
      }
      onSelectionChange(updated);
      return updated;
    });
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

  if (loading)
    return (
      <div className="syl-loading">
        <FaSpinner className="spin" /> Loading Syllabus...
      </div>
    );
  if (error)
    return (
      <div className="syl-error">
        <FaExclamationCircle /> {error}
      </div>
    );
  if (chapters.length === 0)
    return <div className="syl-empty">No chapters found.</div>;

  return (
    <div className="syl-wrapper">
      <h3 className="syl-title">Select Topics from {selectedSubject}</h3>

      {/* 2 Columns Grid */}
      <div className="syl-grid">
        {chapters.map((chapter) => {
          const { checked, indeterminate } = getChapterStatus(chapter);
          const isExpanded = expandedChapters[chapter._id];

          return (
            <div
              key={chapter._id}
              className={`syl-card ${isExpanded ? "expanded" : ""}`}
            >
              {/* Card Header */}
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
                  {/* Safe Name Access for Chapter */}
                  <span className="syl-chap-name">
                    {chapter.name?.en || chapter.name || "Chapter"}
                  </span>
                </div>

                <span className="syl-icon">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </div>

              {/* Topics List */}
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

                      {/* ✅ FIX: 0.0 Topic Name (General Questions) ab show hoga */}
                      <span className="syl-topic-text">
                        {topic.name?.en || topic.name || "General Questions"}
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

      {/* Floating Next Button */}
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
