import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaStar,
  FaLock,
  FaArrowLeft,
  FaFilter,
} from "react-icons/fa";

import ConfirmationModal from "../../common/ConfirmationModal/ConfirmationModal";
import "./PatternSelector.css";
import TMLoader from "../../common/TMLoader/TMLoader";

// ✅ Import Path based on your structure
import PatternForm from "../../../pages/Admin/PaperPatterns/PatternForm";

const PatternSelector = ({
  grade,
  subject,
  onSelect,
  onNext,
  syllabusType, // ✅ PROP RECEIVED
  selectedTopics,
}) => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- 1. FETCH PATTERNS ---
  const fetchPatterns = async () => {
    if (!grade || !subject) {
      setLoading(false);
      return;
    }
    const minDelay = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const [response] = await Promise.all([
        axios.get(`${BASE_URL}/api/patterns`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { grade: grade, subject: subject },
        }),
        minDelay,
      ]);

      setPatterns(response.data);
    } catch (err) {
      console.error("Pattern Fetch Error:", err);
      if (err.response && err.response.status === 404) {
        setPatterns([]);
      } else {
        setError("Failed to load paper patterns. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
    setSelectedId(null);
    onSelect(null);
  }, [grade, subject]);

  // ============================================================
  // 🔥 FILTER LOGIC
  // ============================================================
  const filteredPatterns = useMemo(() => {
    return patterns.filter((p) => {
      const category = p.category || "GENERAL"; // Default fallback

      // 1. Agar User ne "FULL BOOK" select kiya hai
      if (syllabusType === "FULL_BOOK") {
        return category === "FULL_BOOK" || category === "GENERAL";
      }

      // 2. Agar User ne "CHAPTERS" select kiye hain
      if (syllabusType === "CHAPTERS") {
        // To Full Book wale HIDE kar do
        return category !== "FULL_BOOK";
      }

      return true;
    });
  }, [patterns, syllabusType]);
  // ============================================================

  // --- HANDLERS ---
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

  const handleCustomClick = () => {
    setEditingPattern(null);
    setIsCreating(true);
  };

  const handleEditClick = (e, pattern) => {
    e.stopPropagation();
    setEditingPattern(pattern);
    setIsCreating(true);
  };

  const handleBackToSelector = () => {
    setIsCreating(false);
    setEditingPattern(null);
    fetchPatterns();
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal({ ...deleteModal, isOpen: false });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/patterns/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Preset Deleted Successfully");
      setPatterns((prev) => prev.filter((p) => p._id !== deleteModal.id));

      if (selectedId === deleteModal.id) {
        setSelectedId(null);
        onSelect(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete preset");
    }
  };

  if (isCreating) {
    return (
      <div className="fade-in">
        <button
          className="btn btn-link text-decoration-none mb-3 p-0 fw-bold"
          onClick={handleBackToSelector}
        >
          <FaArrowLeft /> Back to Patterns
        </button>

        <PatternForm
          editingPattern={editingPattern}
          onSuccess={handleBackToSelector}
          preFilledGrade={grade}
          preFilledSubject={subject}
          isUserMode={true}
          userSelectedTopics={selectedTopics}
        />
      </div>
    );
  }

  if (loading) {
    return <TMLoader message={`Loading Patterns for ${grade} ${subject}...`} />;
  }

  if (error)
    return (
      <div className="ps-error text-center mt-5">
        <FaExclamationCircle className="text-danger mb-2" size={40} />
        <p className="text-muted">{error}</p>
        <button
          className="btn btn-outline-primary btn-sm mt-2"
          onClick={fetchPatterns}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="ps-container fade-in">
      <div className="text-center mb-4">
        <h3 className="ps-title fw-bold text-primary">Choose Paper Pattern</h3>
        <p className="ps-subtitle text-muted">
          Showing patterns suitable for:{" "}
          <span className="badge bg-dark text-white">
            {syllabusType === "FULL_BOOK"
              ? "Full Syllabus"
              : "Selected Chapters"}
          </span>
        </p>
      </div>

      <div className="ps-grid">
        {/* CREATE CUSTOM CARD */}
        <div className="ps-card custom-card" onClick={handleCustomClick}>
          <div className="custom-content">
            <div className="custom-icon-wrapper">
              <FaPlusCircle />
            </div>
            <h4>Create Custom</h4>
            <p>Define your own sections & marks manually.</p>
          </div>
        </div>

        {/* ✅ USE FILTERED PATTERNS HERE */}
        {filteredPatterns.length > 0 ? (
          filteredPatterns.map((p) => {
            const isSelected = selectedId === p._id;
            const isExpanded = expandedId === p._id;
            const isUserPreset = !p.isSystemPreset;
            const categoryLabel = p.category
              ? p.category.replace("_", " ")
              : "GENERAL";

            return (
              <div
                key={p._id}
                className={`ps-card ${isSelected ? "selected" : ""} ${
                  isExpanded ? "expanded" : ""
                }`}
                onClick={() => handleCardClick(p)}
              >
                {isSelected && (
                  <div className="ps-check">
                    <FaCheckCircle />
                  </div>
                )}

                {isUserPreset && (
                  <div className="ps-card-actions">
                    <button
                      className="ps-action-btn edit"
                      onClick={(e) => handleEditClick(e, p)}
                      title="Edit Pattern"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="ps-action-btn delete"
                      onClick={(e) => handleDeleteClick(e, p._id)}
                      title="Delete Pattern"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}

                <div className="ps-card-header d-flex justify-content-between align-items-start">
                  {/* Badge 1: Category */}
                  <span
                    className={`ps-badge ${
                      p.category === "FULL_BOOK" ? "badge-full" : "badge-half"
                    }`}
                  >
                    {categoryLabel}
                  </span>

                  {/* Badge 2: Complex Long (Only shows if value > 0) */}
                  {p.longQAttemptCount && p.longQAttemptCount > 0 ? (
                    <span
                      className="badge bg-light text-dark border ms-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Complex Long
                    </span>
                  ) : null}
                </div>

                <h4 className="ps-card-name mt-2">{p.name || p.presetName}</h4>

                <div className="ps-card-meta">
                  <span className="meta-tag">
                    <FaStar className="text-warning me-1" />
                    <strong>{p.totalMarks}</strong> Marks
                  </span>
                  <span className="meta-tag">
                    <FaClock className="me-1" /> {p.timeAllowed}
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

                {isExpanded && (
                  <div className="ps-details-panel">
                    <div className="detail-row header">
                      <span>Section</span>
                      <span>Type</span>
                      <span>Qs</span>
                      <span className="text-end">Marks</span>
                    </div>
                    {p.sections.map((sec, idx) => {
                      const attempt = Number(sec.toAttempt) || 0;
                      const totalQ = Number(sec.totalQuestions) || 0;
                      const marksPerQ = Number(sec.marksPerQuestion) || 0;
                      const totalSectionMarks = attempt * marksPerQ;
                      const secTitle =
                        sec.sectionTitle || sec.name || `Section ${idx + 1}`;

                      return (
                        <div key={idx} className="detail-row">
                          <span className="sec-title d-flex align-items-center gap-1">
                            {secTitle}
                            {sec.hasParts && (
                              <small className="part-badge">Parts</small>
                            )}
                            {sec.isCompulsory && (
                              <FaLock
                                className="text-danger"
                                size={10}
                                title="Compulsory"
                              />
                            )}
                          </span>
                          <span className="sec-info text-capitalize small">
                            {sec.questionType || "General"}
                          </span>
                          <span className="sec-info">
                            {attempt}/{totalQ}
                          </span>
                          <span className="sec-info text-end fw-bold">
                            {totalSectionMarks}
                          </span>
                        </div>
                      );
                    })}

                    {p.longQAttemptCount > 0 && (
                      <div className="detail-footer mt-2 pt-2 border-top text-center">
                        <small className="text-muted fst-italic">
                          *Attempt any <strong>{p.longQAttemptCount}</strong>{" "}
                          Long Questions.
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="ps-no-patterns">
            <FaFilter className="mb-2 text-muted" size={24} />
            <p className="text-muted">
              No matching patterns found for <strong>{syllabusType}</strong>.
            </p>
            <p className="small text-muted">
              Try creating a custom pattern or check backend categories.
            </p>
          </div>
        )}
      </div>

      <div className="ps-actions mt-4 text-center">
        <button
          className="btn btn-primary btn-lg px-5 shadow-sm d-inline-flex align-items-center gap-2"
          disabled={!selectedId}
          onClick={onNext}
        >
          Next: Generate Paper <FaFileAlt />
        </button>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Pattern?"
        message="Are you sure you want to delete this custom pattern?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default PatternSelector;
