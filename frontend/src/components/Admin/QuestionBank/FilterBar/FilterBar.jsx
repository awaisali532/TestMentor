import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FilterBar.css"; // Custom CSS

// React Icons
import { FaFilter, FaLayerGroup, FaBook, FaBookmark } from "react-icons/fa";

const FilterBar = ({ onFilterChange }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- DATA LIST STATES ---
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // --- SELECTION STATES ---
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // Loading States (UX ke liye)
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // 1. INITIAL LOAD: Fetch All Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subjects/classes/all`);
        setClasses(res.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // 2. WHEN CLASS CHANGES -> Fetch Related Subjects
  useEffect(() => {
    if (selectedClass) {
      setLoadingSubjects(true);
      const fetchSubjects = async () => {
        try {
          // Backend par filter laga rahe hain (?className=9th)
          const res = await axios.get(
            `${BASE_URL}/api/subjects?className=${selectedClass}`
          );
          setSubjects(res.data);
        } catch (err) {
          console.error("Error fetching subjects:", err);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }

    // RESET DOWNSTREAM (Chain Reaction)
    setSelectedSubject("");
    setSelectedChapter("");
    setChapters([]);
    onFilterChange(null, null, null); // Parent ko batao ke reset ho gaya
  }, [selectedClass]);

  // 3. WHEN SUBJECT CHANGES -> Fetch Related Chapters
  useEffect(() => {
    if (selectedSubject) {
      setLoadingChapters(true);
      const fetchChapters = async () => {
        try {
          const res = await axios.get(
            `${BASE_URL}/api/chapters/subject/${selectedSubject}`
          );
          setChapters(res.data);
        } catch (err) {
          console.error("Error fetching chapters:", err);
        } finally {
          setLoadingChapters(false);
        }
      };
      fetchChapters();
    } else {
      setChapters([]);
    }

    // RESET DOWNSTREAM
    setSelectedChapter("");
    onFilterChange(selectedClass, selectedSubject, ""); // Chapter abhi select nahi hua
  }, [selectedSubject]);

  // 4. WHEN CHAPTER CHANGES -> Final Notify Parent
  const handleChapterChange = (e) => {
    const chapterId = e.target.value;
    setSelectedChapter(chapterId);

    // Yahan hum Parent (QuestionBank Page) ko bata rahe hain ke sab select ho gaya
    onFilterChange(selectedClass, selectedSubject, chapterId);
  };

  return (
    <div className="card filter-card mb-4">
      <div className="card-body p-4">
        {/* Header with Icon */}
        <div className="d-flex align-items-center mb-3">
          <div className="bg-primary bg-opacity-10 p-2 rounded me-2 text-primary">
            <FaFilter />
          </div>
          <h6 className="m-0 fw-bold text-dark">Filter Content</h6>
        </div>

        {/* Filters Row */}
        <div className="row g-3">
          {/* 1. CLASS DROPDOWN */}
          <div className="col-md-4">
            <label className="filter-label">
              <FaLayerGroup className="me-1" /> Class Level{" "}
              <span className="required-mark">*</span>
            </label>
            <select
              className="form-select"
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

          {/* 2. SUBJECT DROPDOWN */}
          <div className="col-md-4">
            <label className="filter-label">
              <FaBook className="me-1" /> Subject{" "}
              <span className="required-mark">*</span>
            </label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass} // Disable agar Class select nahi hai
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

          {/* 3. CHAPTER DROPDOWN */}
          <div className="col-md-4">
            <label className="filter-label">
              <FaBookmark className="me-1" /> Chapter{" "}
              <span className="required-mark">*</span>
            </label>
            <select
              className={`form-select ${
                selectedChapter ? "border-primary border-2" : ""
              }`} // Highlight when selected
              value={selectedChapter}
              onChange={handleChapterChange}
              disabled={!selectedSubject} // Disable agar Subject select nahi hai
            >
              <option value="">
                {loadingChapters ? "Loading..." : "-- Select Chapter --"}
              </option>
              {chapters.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  Ch {ch.chapterNumber}: {ch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
