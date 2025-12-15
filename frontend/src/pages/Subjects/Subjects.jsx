import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBookOpen, FaArrowRight } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Subjects.css";

const Subjects = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allSubjects, setAllSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeClass = searchParams.get("class") || "";

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subjects`);
        const data = res.data;
        setAllSubjects(data);

        const uniqueClasses = [...new Set(data.map((item) => item.className))];
        uniqueClasses.sort();
        setClasses(uniqueClasses);

        if (!searchParams.get("class") && uniqueClasses.length > 0) {
          setSearchParams({ class: uniqueClasses[0] });
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleTabChange = (cls) => {
    setSearchParams({ class: cls });
  };

  const displayedSubjects = allSubjects.filter(
    (sub) => sub.className === activeClass
  );

  if (loading) return <div className="loading-screen">Loading Subjects...</div>;

  return (
    <div className="subjects-page-wrapper">
      <div className="subjects-header">
        <div className="container">
          <h1 className="subjects-title">
            Explore <span className="highlight-text">Subjects</span>
          </h1>
          <p className="subjects-subtitle">
            Select your class level to view available courses.
          </p>
        </div>
      </div>

      <div className="container content-container mt-4">
        {classes.length > 0 ? (
          <>
            <div className="tabs-container">
              {classes.map((cls) => (
                <button
                  key={cls}
                  className={`tab-btn ${activeClass === cls ? "active" : ""}`}
                  onClick={() => handleTabChange(cls)}
                >
                  {cls}
                </button>
              ))}
            </div>

            <div className="row g-4 mt-2">
              {displayedSubjects.length > 0 ? (
                displayedSubjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                  >
                    {/* ✅ RENAMED CLASS: public-subject-card */}
                    <div
                      className="public-subject-card h-100"
                      onClick={() => navigate(`/subjects/${subject._id}`)}
                    >
                      <div className="card-img-wrapper">
                        {subject.image && subject.image.url ? (
                          <img
                            src={subject.image.url}
                            alt={subject.subjectName}
                            className="pub-subject-img"
                          />
                        ) : (
                          <div className="placeholder-img">
                            <FaBookOpen size={40} />
                          </div>
                        )}

                        <div className="overlay">
                          <button className="btn-card-action">
                            <span className="text-idle">View Syllabus</span>
                            <span className="text-hover">
                              Start Now <FaArrowRight className="ms-2" />
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="card-body p-3 text-center">
                        <h5 className="card-title fw-bold m-0">
                          {subject.subjectName}
                        </h5>
                        <p className="small text-muted m-0 mt-1">
                          {activeClass}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">
                  No subjects found for this class.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <h3>No Subjects Available Yet</h3>
            <p className="text-muted">Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
