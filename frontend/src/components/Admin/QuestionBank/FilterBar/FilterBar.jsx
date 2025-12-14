import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FilterBar.css";
import { FaFilter, FaLayerGroup, FaBook, FaBookmark } from "react-icons/fa";

const FilterBar = ({ onFilterChange }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ... (State logic remains exactly the same) ...
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subjects/classes/all`);
        setClasses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoadingSubjects(true);
      axios
        .get(`${BASE_URL}/api/subjects?className=${selectedClass}`)
        .then((res) => setSubjects(res.data))
        .finally(() => setLoadingSubjects(false));
    } else {
      setSubjects([]);
    }
    setSelectedSubject("");
    setSelectedChapter("");
    setChapters([]);
    onFilterChange(null, null, null);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      setLoadingChapters(true);
      axios
        .get(`${BASE_URL}/api/chapters/subject/${selectedSubject}`)
        .then((res) => setChapters(res.data))
        .finally(() => setLoadingChapters(false));
    } else {
      setChapters([]);
    }
    setSelectedChapter("");
    onFilterChange(selectedClass, selectedSubject, "");
  }, [selectedSubject]);

  const handleChapterChange = (e) => {
    const chapterId = e.target.value;
    setSelectedChapter(chapterId);
    onFilterChange(selectedClass, selectedSubject, chapterId);
  };

  return (
    <div className="card filter-card mb-4">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <div className="filter-icon-box me-3">
            <FaFilter />
          </div>
          <div>
            {/* ✅ UPDATED TITLE: "Filter" is normal, "Content" is Gradient */}
            <h5 className="m-0 fw-bold text-main">
              <span className="highlight-text"> Filter </span> Content
            </h5>
            <p className="text-muted small m-0">
              Select Class, Subject & Chapter
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="row g-4">
          <div className="col-md-4">
            <label className="filter-label">
              <FaLayerGroup className="me-2 text-accent" /> Class Level{" "}
              <span className="required-mark">*</span>
            </label>
            <select
              className="form-select custom-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="filter-label">
              <FaBook className="me-2 text-accent" /> Subject{" "}
              <span className="required-mark">*</span>
            </label>
            <select
              className="form-select custom-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">
                {loadingSubjects ? "Loading..." : "-- Select Subject --"}
              </option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectName} ({sub.year})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="filter-label">
              <FaBookmark className="me-2 text-accent" /> Chapter{" "}
              <span className="required-mark">*</span>
            </label>
            <select
              className={`form-select custom-select ${
                selectedChapter ? "active-selection" : ""
              }`}
              value={selectedChapter}
              onChange={handleChapterChange}
              disabled={!selectedSubject}
            >
              <option value="">
                {loadingChapters ? "Loading..." : "-- Select Chapter --"}
              </option>
              {chapters.map((ch) => {
                const chapterName =
                  typeof ch.name === "object" ? ch.name.en : ch.name;
                const urduName =
                  typeof ch.name === "object" && ch.name.ur
                    ? ` (${ch.name.ur})`
                    : "";
                return (
                  <option key={ch._id} value={ch._id}>
                    Ch {ch.chapterNumber}: {chapterName} {urduName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
