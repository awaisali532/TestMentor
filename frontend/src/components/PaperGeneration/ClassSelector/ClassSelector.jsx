import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLayerGroup, FaSpinner, FaGraduationCap } from "react-icons/fa";
import toast from "react-hot-toast";
import "./ClassSelector.css";

const ClassSelector = ({ selectedClass, onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  // --- FETCH CLASSES FROM BACKEND ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        // Hum subjects mangwa rahe hain taake unme se classes extract kar sakein
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subjects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (Array.isArray(data)) {
          // Extract Unique Classes (e.g. ["9th", "10th", "Inter-I"])
          const uniqueClasses = [
            ...new Set(data.map((item) => item.className).filter((c) => c)),
          ].sort();

          setClasses(uniqueClasses);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="cs-loader">
        <FaSpinner className="icon-spin" />
        <p>Loading Classes...</p>
      </div>
    );
  }

  return (
    <div className="cs-container fade-in-up">
      <div className="cs-header">
        <h2>Choose Class Level</h2>
        <p>Select the grade you want to generate a paper for.</p>
      </div>

      {classes.length > 0 ? (
        <div className="cs-grid">
          {classes.map((cls, index) => (
            <div
              key={index}
              className={`cs-card ${selectedClass === cls ? "selected" : ""}`}
              onClick={() => onSelect(cls)}
              style={{ animationDelay: `${index * 0.1}s` }} // Staggered Animation
            >
              <div className="cs-icon-wrapper">
                <FaGraduationCap />
              </div>
              <h3 className="cs-title">{cls}</h3>
              <div className="cs-status">Tap to select</div>

              {/* Decorative Background Shape */}
              <div className="cs-bg-shape"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cs-empty">
          <FaLayerGroup />
          <p>No classes found in database.</p>
        </div>
      )}
    </div>
  );
};

export default ClassSelector;
