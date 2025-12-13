import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa"; // Added FaSignInAlt
import { useUser } from "../../../context/UserContext";
import toast from "react-hot-toast"; // ✅ Using react-hot-toast
import "./SubjectDetails.css";

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState({});

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

  // ✅ UPDATED: Custom Toast for Login
  const handleStartTest = (topicId) => {
    if (!user) {
      // Create a custom toast with a button
      toast(
        (t) => (
          <div className="d-flex flex-column gap-2 align-items-center">
            <span className="fw-bold text-dark">🔒 Login Required</span>
            <span className="small text-muted text-center">
              You must be logged in to attempt this test.
            </span>
            <button
              className="btn btn-sm btn-primary w-100 mt-1 d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                toast.dismiss(t.id); // Close toast
                navigate("/login"); // Go to Login
              }}
            >
              <FaSignInAlt /> Login Now
            </button>
          </div>
        ),
        {
          duration: 4000, // Stay for 4 seconds
          position: "top-center",
          style: {
            border: "1px solid #e2e8f0",
            padding: "16px",
            color: "#713200",
          },
        }
      );
    } else {
      navigate(`/test/topic/${topicId}`);
    }
  };

  if (loading) return <div className="loading-screen">Loading Syllabus...</div>;
  if (!data) return <div className="text-center py-5">Subject not found.</div>;

  const { subject, hierarchy } = data;

  return (
    <div className="details-wrapper">
      {/* 1. HERO HEADER */}
      <div className="details-header">
        <div className="container">
          <h1 className="fw-bold">{subject.subjectName}</h1>
          <span className="badge bg-light text-dark fs-6 px-3 py-2 rounded-pill">
            {subject.className}
          </span>
        </div>
      </div>

      {/* 2. SYLLABUS CONTENT */}
      <div className="container mt-5" style={{ maxWidth: "900px" }}>
        <h4 className="fw-bold text-dark mb-4">Course Syllabus</h4>

        {hierarchy.length === 0 ? (
          <div className="text-center text-muted">No chapters added yet.</div>
        ) : (
          <div className="accordion-list">
            {hierarchy.map((chapter) => (
              <div key={chapter._id} className="chapter-item mb-3 shadow-sm">
                {/* Chapter Header */}
                <div
                  className={`chapter-header p-3 d-flex justify-content-between align-items-center cursor-pointer ${
                    openChapters[chapter._id] ? "active" : ""
                  }`}
                  onClick={() => toggleChapter(chapter._id)}
                >
                  <div>
                    <small
                      className="text-uppercase text-muted fw-bold"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Chapter {chapter.chapterNumber}
                    </small>
                    <h5 className="m-0 fw-bold text-dark">
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
                  <div className="chapter-body bg-white border-top">
                    {chapter.topics.length > 0 ? (
                      chapter.topics.map((topic) => (
                        <div
                          key={topic._id}
                          className="topic-row p-3 d-flex justify-content-between align-items-center border-bottom"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-light text-secondary border">
                              {topic.topicNumber}
                            </span>
                            <span className="fw-medium text-dark">
                              {typeof topic.name === "object"
                                ? topic.name.en
                                : topic.name}
                            </span>
                          </div>

                          <button
                            className={`btn btn-sm ${
                              user ? "btn-primary" : "btn-outline-primary"
                            } px-3 rounded-pill fw-bold`}
                            onClick={() => handleStartTest(topic._id)}
                          >
                            {user ? (
                              <>
                                <FaPlay className="me-2" size={10} /> Start
                              </>
                            ) : (
                              <>
                                <FaLock className="me-2" size={10} /> Start
                              </>
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-muted small fst-italic">
                        No topics available.
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
