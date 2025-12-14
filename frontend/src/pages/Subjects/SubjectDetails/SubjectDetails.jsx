import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaLock,
  FaSignInAlt,
  FaBookOpen,
  FaTimes, // ✅ Close Icon
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import toast from "react-hot-toast";
import "./SubjectDetails.css";

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState({});

  // ✅ New State for Custom Login Popup
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/subjects/${id}/full-details`
        );
        setData(res.data);

        if (res.data.hierarchy.length > 0) {
          setOpenChapters({ [res.data.hierarchy[0]._id]: true });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load subject details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // ✅ Updated Logic: Show Popup instead of Toast
  const handleStartTest = (topicId) => {
    if (!user) {
      setShowLoginPopup(true); // Open Custom Popup
    } else {
      navigate(`/test/topic/${topicId}`);
    }
  };

  // ✅ Handle Click Outside (Overlay Click)
  const handleOverlayClick = (e) => {
    if (e.target.className.includes("popup-overlay")) {
      setShowLoginPopup(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Syllabus...</div>;
  if (!data)
    return <div className="text-center py-5 mt-5">Subject not found.</div>;

  const { subject, hierarchy } = data;

  return (
    <div className="details-wrapper">
      {/* ✅ CUSTOM LOGIN POPUP */}
      {showLoginPopup && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="login-popup-card">
            <button
              className="close-btn"
              onClick={() => setShowLoginPopup(false)}
            >
              <FaTimes />
            </button>
            <div className="icon-circle">
              <FaLock />
            </div>
            <h4>Login Required</h4>
            <p>
              You need to login to attempt this test and save your progress.
            </p>
            <button
              className="btn-login-popup"
              onClick={() => navigate("/login")}
            >
              <FaSignInAlt /> Login Now
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="details-header text-center">
        <div className="container">
          <span className="badge-class">{subject.className}</span>
          <h1 className="subject-title">
            <span className="highlight-text">{subject.subjectName}</span>
          </h1>
          <p className="subject-subtitle">
            Master this subject with chapter-wise tests and instant results.
          </p>
        </div>
      </div>

      {/* SYLLABUS CONTENT */}
      <div className="container mt-4" style={{ maxWidth: "800px" }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <FaBookOpen className="text-primary" />
          <h4 className="fw-bold m-0 text-main">Course Syllabus</h4>
        </div>

        {hierarchy.length === 0 ? (
          <div className="empty-state">
            <p>No chapters added yet.</p>
          </div>
        ) : (
          <div className="accordion-list">
            {hierarchy.map((chapter) => (
              <div key={chapter._id} className="chapter-item mb-3">
                {/* Chapter Header */}
                <div
                  className={`chapter-header p-3 d-flex justify-content-between align-items-center ${
                    openChapters[chapter._id] ? "active" : ""
                  }`}
                  onClick={() => toggleChapter(chapter._id)}
                >
                  <div className="d-flex flex-column">
                    <span className="chapter-label">
                      CHAPTER {chapter.chapterNumber}
                    </span>
                    <h5 className="chapter-name">
                      {typeof chapter.name === "object"
                        ? chapter.name.en
                        : chapter.name}
                    </h5>
                  </div>
                  <div className="icon-box">
                    {openChapters[chapter._id] ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </div>
                </div>

                {/* Topics List */}
                {openChapters[chapter._id] && (
                  <div className="chapter-body">
                    {chapter.topics.length > 0 ? (
                      chapter.topics.map((topic) => (
                        <div
                          key={topic._id}
                          className="topic-row p-3 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <span className="topic-number">
                              {topic.topicNumber}
                            </span>
                            <span className="topic-name">
                              {typeof topic.name === "object"
                                ? topic.name.en
                                : topic.name}
                            </span>
                          </div>

                          <button
                            className={`btn-start ${
                              user ? "unlocked" : "locked"
                            }`}
                            onClick={() => handleStartTest(topic._id)}
                          >
                            {user ? (
                              <>
                                Start <FaPlay size={10} />
                              </>
                            ) : (
                              <>
                                <FaLock size={12} />
                              </>
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-muted small fst-italic text-center">
                        No topics available in this chapter.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetails;
