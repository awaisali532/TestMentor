import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaExclamationCircle } from "react-icons/fa";
import "./SubjectSelector.css";

const SubjectSelector = ({ selectedClass, onSelect }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend URL (Make sure port is correct)
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ CORRECT ROUTE & PARAMETER
        // Route: /api/subjects
        // Param: className (Backend yahi maang raha hai)
        const response = await axios.get(`${API_BASE_URL}/api/subjects`, {
          params: { className: selectedClass },
        });

        // Agar backend filter kar raha hai to direct data use karein
        setSubjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects.");
        setLoading(false);
      }
    };

    if (selectedClass) {
      fetchSubjects();
    }
  }, [selectedClass]);

  // --- Handlers ---
  const handleCardClick = (subject) => {
    // Subject ka naam aur ID bhej rahe hain
    // Backend se data "_id" aur "subjectName" ke sath aa raha hoga
    onSelect(subject.subjectName);
  };

  // --- Render Loading ---
  if (loading) {
    return (
      <div className="sub-loading">
        <FaSpinner className="spin-icon" />
        <p>Fetching Subjects for {selectedClass}...</p>
      </div>
    );
  }

  // --- Render Error ---
  if (error) {
    return (
      <div className="sub-error">
        <FaExclamationCircle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="sub-container">
      <h2 className="sub-title">Select Subject for {selectedClass}</h2>

      <div className="sub-grid">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <div
              key={subject._id}
              className="sub-card"
              onClick={() => handleCardClick(subject)}
            >
              {/* Image Section */}
              <div className="sub-img-box">
                {/* Cloudinary URL check */}
                {subject.image && subject.image.url ? (
                  <img
                    src={subject.image.url}
                    alt={subject.subjectName}
                    className="sub-img"
                  />
                ) : (
                  <div className="no-img-placeholder">No Image</div>
                )}
              </div>

              {/* Text Section */}
              <div className="sub-info">
                <h4 className="sub-name">{subject.subjectName}</h4>
                <span className="sub-year">{subject.year || "N/A"} </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No subjects found for class {selectedClass}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelector;
