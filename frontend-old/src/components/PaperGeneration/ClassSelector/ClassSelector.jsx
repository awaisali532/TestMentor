import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLayerGroup, FaGraduationCap } from "react-icons/fa";
import toast from "react-hot-toast";
import "./ClassSelector.css";

// ✅ Custom TM Loader
import TMLoader from "../../common/TMLoader/TMLoader";

const ClassSelector = ({ selectedClass, onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      // ✅ STEP 1: Minimum Delay Timer (1 Second)
      // Ye promise 1 second baad resolve hoga
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const token = localStorage.getItem("token");

        // ✅ STEP 2: Run API & Timer Together
        // Promise.all tab tak wait karega jab tak DONO kaam na ho jayen
        const [response] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          minDelay, // Delay ka wait bhi hoga
        ]);

        const { data } = response;

        if (Array.isArray(data)) {
          const uniqueClasses = [
            ...new Set(data.map((item) => item.className).filter((c) => c)),
          ].sort();
          setClasses(uniqueClasses);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      } finally {
        // ✅ 1 Second guzarne ke baad hi ye chalega
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // ✅ LOADER STATE
  if (loading) {
    return <TMLoader message="Loading Classes" />;
  }

  // ✅ MAIN CONTENT
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
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="cs-icon-wrapper">
                <FaGraduationCap />
              </div>
              <h3 className="cs-title">{cls}</h3>
              <div className="cs-status">Tap to select</div>
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
