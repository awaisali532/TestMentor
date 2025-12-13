import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBookOpen } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ Added useSearchParams
import "./Subjects.css";

const Subjects = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const navigate = useNavigate();

  // ✅ URL Params Hook
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATES ---
  const [allSubjects, setAllSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // We derive activeClass directly from URL or default to empty string initially
  const activeClass = searchParams.get("class") || "";

  // --- INITIAL FETCH ---
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subjects`);
        const data = res.data;

        setAllSubjects(data);

        // Extract unique classes
        const uniqueClasses = [...new Set(data.map((item) => item.className))];
        uniqueClasses.sort(); // Sort naturally (9th, 10th...)
        setClasses(uniqueClasses);

        // ✅ LOGIC: If URL has no class, set the first one automatically
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
  }, []); // Run once on mount

  // --- HANDLER: Change Tab ---
  const handleTabChange = (cls) => {
    setSearchParams({ class: cls }); // ✅ Update URL instead of just state
  };

  // --- FILTER LOGIC ---
  const displayedSubjects = allSubjects.filter(
    (sub) => sub.className === activeClass
  );

  if (loading) return <div className="loading-screen">Loading Subjects...</div>;

  return (
    <div className="subjects-page-wrapper">
      <div className="subjects-header">
        <div className="container">
          <h1 className="fw-bold">Explore Subjects</h1>
          <p className="opacity-75">
            Select your class level to view available courses.
          </p>
        </div>
      </div>

      <div className="container mt-4">
        {/* DYNAMIC TABS */}
        {classes.length > 0 ? (
          <>
            <div className="tabs-container sticky-top-tabs">
              {classes.map((cls) => (
                <button
                  key={cls}
                  className={`tab-btn ${activeClass === cls ? "active" : ""}`}
                  onClick={() => handleTabChange(cls)} // ✅ Use Handler
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* SUBJECTS GRID */}
            <div className="row g-4 mt-2">
              {displayedSubjects.length > 0 ? (
                displayedSubjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                  >
                    <div
                      className="subject-card h-100"
                      onClick={() => navigate(`/subjects/${subject._id}`)}
                    >
                      <div className="card-img-wrapper">
                        {subject.image && subject.image.url ? (
                          <img
                            src={subject.image.url}
                            alt={subject.subjectName}
                            className="subject-img"
                          />
                        ) : (
                          <div className="placeholder-img">
                            <FaBookOpen size={40} />
                          </div>
                        )}
                        <div className="overlay">
                          <button className="btn btn-light btn-sm fw-bold">
                            View Syllabus
                          </button>
                        </div>
                      </div>

                      <div className="card-body p-3 text-center">
                        <h5 className="card-title fw-bold text-dark m-0">
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
