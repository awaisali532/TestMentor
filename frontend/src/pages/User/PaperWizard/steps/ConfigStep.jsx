import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBook,
  FaCalendarAlt,
  FaLayerGroup,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaArrowRight,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "./ConfigStep.css";

const ConfigStep = ({ config, setConfig, onNext }) => {
  const [openSection, setOpenSection] = useState("grade");
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);

  const [allSubjects, setAllSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  // Stores Chapters with their Topics
  const [availableChapters, setAvailableChapters] = useState([]);
  // Stores which chapters are expanded in UI
  const [expandedChapters, setExpandedChapters] = useState([]);

  // --- 1. FETCH INITIAL DATA ---
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subjects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (Array.isArray(data)) {
          setAllSubjects(data);
          const uniqueClasses = [
            ...new Set(data.map((item) => item.className).filter((c) => c)),
          ].sort();
          setAvailableClasses(uniqueClasses);

          if (config.grade) {
            const subjectsForClass = data.filter(
              (sub) => sub.className === config.grade
            );
            setFilteredSubjects(subjectsForClass);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [config.grade]);

  // --- HANDLERS ---

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? "" : sectionName);
  };

  // 1. GRADE SELECT
  const handleGradeSelect = (selectedGrade) => {
    if (config.grade === selectedGrade) {
      setOpenSection("subject");
      return;
    }

    setConfig({
      ...config,
      grade: selectedGrade,
      subject: "",
      topics: [],
      paperTitle: "",
      mcqCount: "",
      shortCount: "",
      longCount: "",
    });

    const subjectsForClass = allSubjects.filter(
      (sub) => sub.className === selectedGrade
    );
    setFilteredSubjects(subjectsForClass);
    setOpenSection("subject");
  };

  // 2. SUBJECT SELECT -> FETCH SYLLABUS
  const handleSubjectSelect = async (subjectName) => {
    if (config.subject === subjectName) {
      setOpenSection("syllabus");
      return;
    }

    setConfig({
      ...config,
      subject: subjectName,
      topics: [],
      paperTitle: "",
      mcqCount: "",
      shortCount: "",
      longCount: "",
    });

    setChapterLoading(true);
    setOpenSection("syllabus");

    try {
      const token = localStorage.getItem("token");
      // Call the NEW backend route
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chapters/filter`,
        {
          params: { className: config.grade, subjectName: subjectName },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAvailableChapters(data);
      // Auto expand chapters that have topics
      setExpandedChapters(data.map((c) => c._id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch syllabus");
    } finally {
      setChapterLoading(false);
    }
  };

  // --- SYLLABUS LOGIC ---

  // A. Toggle UI Expand/Collapse
  const toggleChapterExpand = (e, chapId) => {
    e.stopPropagation(); // Prevent parent click
    setExpandedChapters((prev) =>
      prev.includes(chapId)
        ? prev.filter((id) => id !== chapId)
        : [...prev, chapId]
    );
  };

  // B. Select Whole Chapter (All its topics)
  const handleChapterSelect = (chapter) => {
    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const currentTopics = config.topics || [];

    // Check if all are already selected
    const isAllSelected = chapterTopicIds.every((id) =>
      currentTopics.includes(id)
    );

    let newTopics;
    if (isAllSelected) {
      // Unselect All
      newTopics = currentTopics.filter((id) => !chapterTopicIds.includes(id));
    } else {
      // Select All (Unique Merge)
      newTopics = [...new Set([...currentTopics, ...chapterTopicIds])];
    }
    setConfig({ ...config, topics: newTopics });
  };

  // C. Select Single Topic
  const handleTopicSelect = (topicId) => {
    const currentTopics = config.topics || [];
    let newTopics;
    if (currentTopics.includes(topicId)) {
      newTopics = currentTopics.filter((id) => id !== topicId);
    } else {
      newTopics = [...currentTopics, topicId];
    }
    setConfig({ ...config, topics: newTopics });
  };

  // Helper: Check Chapter Status (Full, Partial, None)
  const getChapterStatus = (chapter) => {
    if (!chapter.topics || chapter.topics.length === 0) return "empty";

    const chapterTopicIds = chapter.topics.map((t) => t._id);
    const selectedCount = chapterTopicIds.filter((id) =>
      config.topics?.includes(id)
    ).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === chapterTopicIds.length) return "full";
    return "partial";
  };

  // Pattern Handler
  const handlePatternChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("Count") && value < 0) return;
    setConfig({ ...config, [name]: value });
  };

  // Validation
  const mcq = parseInt(config.mcqCount || 0);
  const short = parseInt(config.shortCount || 0);
  const long = parseInt(config.longCount || 0);
  const totalQuestions = mcq + short + long;

  const isValid =
    config.grade &&
    config.subject &&
    config.topics &&
    config.topics.length > 0 && // At least 1 topic selected
    config.paperTitle &&
    totalQuestions > 0;

  if (loading)
    return (
      <div className="p-5 text-center text-muted">
        <FaSpinner className="icon-spin" /> Loading...
      </div>
    );

  return (
    <div className="step-container fade-in">
      {/* 1. CLASS */}
      <div
        className={`config-card ${
          openSection === "grade" ? "active" : "collapsed"
        }`}
      >
        <div className="config-header" onClick={() => toggleSection("grade")}>
          <div className="d-flex align-items-center gap-3">
            <div className={`step-icon ${config.grade ? "completed" : ""}`}>
              {config.grade ? <FaCheck /> : "1"}
            </div>
            <h5 className="m-0">Select Class</h5>
          </div>
          <div className="selection-preview">{config.grade}</div>
          {openSection === "grade" ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSection === "grade" && (
          <div className="config-body">
            {availableClasses.length > 0 ? (
              <div className="grid-options">
                {availableClasses.map((cls, idx) => (
                  <button
                    key={idx}
                    className={`option-btn ${
                      config.grade === cls ? "selected" : ""
                    }`}
                    onClick={() => handleGradeSelect(cls)}
                  >
                    <FaLayerGroup className="mb-2 text-xl" /> {cls}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted">No classes found.</p>
            )}
          </div>
        )}
      </div>

      {/* 2. SUBJECT */}
      <div
        className={`config-card ${
          openSection === "subject" ? "active" : "collapsed"
        } ${!config.grade ? "disabled" : ""}`}
      >
        <div
          className="config-header"
          onClick={() => config.grade && toggleSection("subject")}
        >
          <div className="d-flex align-items-center gap-3">
            <div className={`step-icon ${config.subject ? "completed" : ""}`}>
              {config.subject ? <FaCheck /> : "2"}
            </div>
            <h5 className="m-0">Select Subject</h5>
          </div>
          <div className="selection-preview">{config.subject}</div>
          {openSection === "subject" ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSection === "subject" && config.grade && (
          <div className="config-body">
            {filteredSubjects.length > 0 ? (
              <div className="grid-subjects">
                {filteredSubjects.map((sub) => (
                  <div
                    key={sub._id}
                    className={`subject-card ${
                      config.subject === sub.subjectName ? "selected" : ""
                    }`}
                    onClick={() => handleSubjectSelect(sub.subjectName)}
                  >
                    <div className="subject-img-wrapper">
                      {sub.image?.url ? (
                        <img src={sub.image.url} alt={sub.subjectName} />
                      ) : (
                        <div className="no-img">
                          <FaBook />
                        </div>
                      )}
                    </div>
                    <div className="subject-name">{sub.subjectName}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted">No subjects found.</p>
            )}
          </div>
        )}
      </div>

      {/* ✅ 3. SYLLABUS (TREE VIEW) */}
      <div
        className={`config-card ${
          openSection === "syllabus" ? "active" : "collapsed"
        } ${!config.subject ? "disabled" : ""}`}
      >
        <div
          className="config-header"
          onClick={() => config.subject && toggleSection("syllabus")}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className={`step-icon ${
                config.topics?.length > 0 ? "completed" : ""
              }`}
            >
              {config.topics?.length > 0 ? <FaCheck /> : "3"}
            </div>
            <h5 className="m-0">Select Syllabus</h5>
          </div>
          <div className="selection-preview">
            {config.topics?.length > 0 ? `${config.topics.length} Topics` : ""}
          </div>
          {openSection === "syllabus" ? <FaChevronUp /> : <FaChevronDown />}
        </div>

        {openSection === "syllabus" && (
          <div className="config-body">
            {chapterLoading ? (
              <div className="text-center p-3 text-muted">
                <FaSpinner className="icon-spin" /> Fetching Chapters...
              </div>
            ) : availableChapters.length > 0 ? (
              <>
                <div className="syllabus-tree">
                  {availableChapters.map((chap) => {
                    const status = getChapterStatus(chap); // full, partial, none
                    const isExpanded = expandedChapters.includes(chap._id);

                    return (
                      <div key={chap._id} className={`chapter-node ${status}`}>
                        {/* Chapter Row */}
                        <div className="chapter-row">
                          <div
                            className="row-left"
                            onClick={(e) => toggleChapterExpand(e, chap._id)}
                          >
                            {isExpanded ? (
                              <FaChevronUp className="toggle-icon" />
                            ) : (
                              <FaChevronDown className="toggle-icon" />
                            )}
                            <div className="chap-info">
                              <span className="chap-num">
                                CH-{chap.chapterNumber}
                              </span>
                              <span className="chap-title">{chap.name.en}</span>
                            </div>
                          </div>

                          {/* Checkbox */}
                          <div
                            className="checkbox-wrapper"
                            onClick={() => handleChapterSelect(chap)}
                          >
                            <div className={`custom-checkbox ${status}`}>
                              {status === "full" && <FaCheck size={10} />}
                              {status === "partial" && (
                                <div className="partial-dot"></div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nested Topics */}
                        {isExpanded && (
                          <div className="topics-list">
                            {chap.topics && chap.topics.length > 0 ? (
                              chap.topics.map((topic) => (
                                <div
                                  key={topic._id}
                                  className={`topic-item ${
                                    config.topics?.includes(topic._id)
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => handleTopicSelect(topic._id)}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="topic-num">
                                      {topic.topicNumber}
                                    </span>
                                    <span className="topic-text">
                                      {topic.name.en}
                                    </span>
                                  </div>
                                  {config.topics?.includes(topic._id) && (
                                    <FaCheck className="topic-check" />
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="no-topics">
                                No topics added in this chapter
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-end mt-4">
                  <button
                    className="btn-next-step"
                    onClick={() => setOpenSection("pattern")}
                    disabled={!config.topics || config.topics.length === 0}
                  >
                    Next: Set Pattern
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-muted">
                No syllabus found for this subject.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 4. PATTERN */}
      <div
        className={`config-card ${
          openSection === "pattern" ? "active" : "collapsed"
        } ${!config.topics || config.topics.length === 0 ? "disabled" : ""}`}
      >
        <div
          className="config-header"
          onClick={() => config.topics?.length > 0 && toggleSection("pattern")}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="step-icon">4</div>
            <h5 className="m-0">Paper Pattern</h5>
          </div>
          {openSection === "pattern" ? <FaChevronUp /> : <FaChevronDown />}
        </div>

        {openSection === "pattern" && (
          <div className="config-body">
            <div className="form-row">
              <div className="form-group col-md-8">
                <label>
                  Paper Title <span className="req-star">*</span>
                </label>
                <div className="input-box">
                  <FaCalendarAlt className="field-icon" />
                  <input
                    type="text"
                    name="paperTitle"
                    placeholder="e.g. Grand Test 1"
                    className="neon-input"
                    value={config.paperTitle}
                    onChange={handlePatternChange}
                  />
                </div>
              </div>
              <div className="form-group col-md-4">
                <label>
                  Medium <span className="req-star">*</span>
                </label>
                <select
                  name="medium"
                  className="neon-input"
                  value={config.medium}
                  onChange={handlePatternChange}
                >
                  <option value="both">Both</option>
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
            </div>

            <div className="counts-grid mt-4">
              <div className="count-box">
                <label>MCQs</label>
                <input
                  type="number"
                  min="0"
                  name="mcqCount"
                  className="count-input"
                  placeholder="e.g. 12"
                  value={config.mcqCount}
                  onChange={handlePatternChange}
                />
              </div>
              <div className="count-box">
                <label>Short Qs</label>
                <input
                  type="number"
                  min="0"
                  name="shortCount"
                  className="count-input"
                  placeholder="e.g. 15"
                  value={config.shortCount}
                  onChange={handlePatternChange}
                />
              </div>
              <div className="count-box">
                <label>Long Qs</label>
                <input
                  type="number"
                  min="0"
                  name="longCount"
                  className="count-input"
                  placeholder="e.g. 3"
                  value={config.longCount}
                  onChange={handlePatternChange}
                />
              </div>
            </div>

            <div className="action-row mt-5">
              <button
                className="btn-next-step"
                onClick={onNext}
                disabled={!isValid}
              >
                Save & Continue <FaArrowRight className="ms-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigStep;
