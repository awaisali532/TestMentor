import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaExclamationCircle } from "react-icons/fa"; // ❌ FaSpinner Removed
import "./SubjectSelector.css";

// ✅ Import Custom TM Loader
import TMLoader from "../../common/TMLoader/TMLoader";

const SubjectSelector = ({ selectedClass, onSelect }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSubjects = async () => {
      // ✅ STEP 1: Minimum Delay (1 Second)
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        setLoading(true);
        setError(null);

        // ✅ STEP 2: Run API & Timer Together
        const [response] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/subjects`, {
            params: { className: selectedClass },
          }),
          minDelay, // Delay wait karega
        ]);

        setSubjects(response.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects.");
      } finally {
        // ✅ 1 Second baad hi loading khatam hogi
        setLoading(false);
      }
    };

    if (selectedClass) {
      fetchSubjects();
    }
  }, [selectedClass]);

  // --- Handlers ---
  const handleCardClick = (subject) => {
    onSelect(subject.subjectName);
  };

  // ✅ NEW LOADER LOGIC
  if (loading) {
    return <TMLoader message={`Fetching Subjects for ${selectedClass}...`} />;
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
    <div className="sub-container fade-in-up">
      {" "}
      {/* Added fade-in animation */}
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
