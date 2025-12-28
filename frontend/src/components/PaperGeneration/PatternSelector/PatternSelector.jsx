import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaExclamationCircle, // ❌ FaSpinner Removed
  FaChevronDown,
  FaChevronUp,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaStar,
} from "react-icons/fa";

import ConfirmationModal from "../../common/ConfirmationModal/ConfirmationModal";
import "./PatternSelector.css";

// ✅ Import Custom TM Loader
import TMLoader from "../../common/TMLoader/TMLoader";

const PatternSelector = ({
  grade,
  subject,
  onSelect,
  onNext,
  onCreateCustom,
  onEdit,
}) => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- 1. FETCH PRESETS ---
  const fetchPatterns = async () => {
    // ✅ 1 Second Delay Logic
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ✅ API + Timer Together
      const [response] = await Promise.all([
        axios.get(`${BASE_URL}/api/patterns`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { grade: grade, subject: subject },
        }),
        minDelay,
      ]);

      setPatterns(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Pattern Fetch Error:", err);
      setError("Failed to load paper patterns.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (grade && subject) fetchPatterns();
  }, [grade, subject]);

  // --- 2. HANDLERS (Same as before) ---

  const handleCardClick = (pattern) => {
    if (selectedId === pattern._id) {
      setSelectedId(null);
      onSelect(null);
    } else {
      setSelectedId(pattern._id);
      onSelect(pattern);
    }
  };

  const toggleDetails = (e, id) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCustomClick = () => onCreateCustom();

  const handleEditClick = (e, pattern) => {
    e.stopPropagation();
    onEdit(pattern);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/patterns/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Preset Deleted");
      setPatterns((prev) => prev.filter((p) => p._id !== deleteModal.id));

      if (selectedId === deleteModal.id) {
        setSelectedId(null);
        onSelect(null);
      }
    } catch (err) {
      toast.error("Failed to delete preset");
    }
  };

  // ✅ LOADER LOGIC
  if (loading) {
    return <TMLoader message={`Loading Patterns for ${subject}...`} />;
  }

  // --- ERROR STATE ---
  if (error)
    return (
      <div className="ps-error">
        <FaExclamationCircle /> {error}
      </div>
    );

  // --- MAIN UI ---
  return (
    <div className="ps-container fade-in">
      {" "}
      {/* Added Animation */}
      <h3 className="ps-title">Choose Paper Pattern</h3>
      <p className="ps-subtitle">
        Select a preset or create your own for{" "}
        <strong>
          {grade} - {subject}
        </strong>
      </p>
      <div className="ps-grid">
        {/* CREATE CUSTOM CARD */}
        <div className="ps-card custom-card" onClick={handleCustomClick}>
          <div className="custom-content">
            <FaPlusCircle className="custom-icon" />
            <h4>Create Custom</h4>
            <p>Define your own sections & marks manually.</p>
          </div>
        </div>

        {/* PRESETS LIST */}
        {patterns.map((p) => {
          const isSelected = selectedId === p._id;
          const isExpanded = expandedId === p._id;
          const isUserPreset = !p.isSystemPreset;

          return (
            <div
              key={p._id}
              className={`ps-card ${isSelected ? "selected" : ""} ${
                isExpanded ? "expanded" : ""
              }`}
              onClick={() => handleCardClick(p)}
            >
              {/* CHECKMARK */}
              {isSelected && (
                <div className="ps-check">
                  <FaCheckCircle />
                </div>
              )}

              {/* ACTIONS */}
              {isUserPreset && (
                <div className="ps-card-actions">
                  <button
                    className="ps-action-btn edit"
                    onClick={(e) => handleEditClick(e, p)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="ps-action-btn delete"
                    onClick={(e) => handleDeleteClick(e, p._id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}

              {/* HEADER */}
              <div className="ps-card-header">
                <span
                  className={`ps-badge ${
                    p.type === "FULL_BOOK" ? "badge-full" : "badge-half"
                  }`}
                >
                  {p.type.replace("_", " ")}
                </span>
              </div>

              <h4 className="ps-card-name">{p.presetName}</h4>

              {/* META INFO */}
              <div className="ps-card-meta">
                <span className="meta-tag">
                  <FaStar className="text-warning" />{" "}
                  <strong>{p.totalMarks}</strong> Marks
                </span>
                <span className="meta-tag">
                  <FaClock /> {p.timeAllowed}
                </span>
              </div>

              <button
                className="btn-details"
                onClick={(e) => toggleDetails(e, p._id)}
              >
                {isExpanded ? (
                  <>
                    <FaChevronUp /> Hide Details
                  </>
                ) : (
                  <>
                    <FaChevronDown /> View Sections ({p.sections.length})
                  </>
                )}
              </button>

              {/* EXPANDED DETAILS */}
              {isExpanded && (
                <div className="ps-details-panel">
                  <div className="detail-row header">
                    <span>Section</span>
                    <span>Type</span>
                    <span>Qs</span>
                    <span>Marks</span>
                  </div>
                  {p.sections.map((sec, idx) => (
                    <div key={idx} className="detail-row">
                      <span className="sec-title">
                        {sec.title}
                        {sec.hasParts && (
                          <small className="part-badge">Parts</small>
                        )}
                      </span>
                      <span className="sec-info">{sec.questionType}</span>
                      <span className="sec-info">
                        {sec.toBeAttempted}/{sec.totalQuestions}
                      </span>
                      <span className="sec-info">x{sec.marksPerQuestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="ps-actions">
        <button
          className="btn btn-primary px-5 py-3"
          disabled={!selectedId}
          onClick={onNext}
        >
          Next: Generate Paper <FaFileAlt className="ms-2" />
        </button>
      </div>
      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Preset?"
        message="Are you sure you want to delete this custom preset? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Keep"
        isDanger={true}
      />
    </div>
  );
};

export default PatternSelector;
