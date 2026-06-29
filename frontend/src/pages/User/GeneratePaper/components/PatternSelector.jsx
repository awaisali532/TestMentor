import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
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
  FaFilter,
} from "react-icons/fa";
import Loader from "../../../../components/ui/Loader";
import PatternForm from "../../../Admin/PaperPatterns/PatternForm"; // Ensure path is correct based on your folder structure

const PatternSelector = ({
  grade,
  subject,
  onSelect,
  onNext,
  syllabusType,
  selectedTopics,
}) => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
          params: { grade, subject },
        }),
        minDelay,
      ]);
      setPatterns(response.data);
    } catch (err) {
      if (err.response?.status === 404) setPatterns([]);
      else setError("Failed to load paper patterns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
    setSelectedId(null);
    onSelect(null);
  }, [grade, subject]);

  const filteredPatterns = useMemo(() => {
    return patterns.filter((p) => {
      const category = p.category || "GENERAL"; // Backend se aane wali category

      // 1. Agar pichle page se "FULL_BOOK" select hua hai
      if (syllabusType === "FULL_BOOK") {
        // Sirf Full Book ya General patterns dikhao
        return category === "FULL_BOOK" || category === "GENERAL";
      }

      // 2. Agar pichle page se "CHAPTERS" (Chapter Wise) select hua hai
      if (syllabusType === "CHAPTERS") {
        // Full Book aur Half Book dono hide kar do! Sirf Chapter Wise dikhao
        return category === "CHAPTER_WISE" || category === "GENERAL";
      }

      return true;
    });
  }, [patterns, syllabusType]);

  const handleCardClick = (pattern) => {
    if (selectedId === pattern._id) {
      setSelectedId(null);
      onSelect(null);
    } else {
      setSelectedId(pattern._id);
      onSelect(pattern);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    Swal.fire({
      title: "Delete Pattern?",
      text: "Are you sure you want to delete this custom pattern?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Delete",
      background: "#0f172a",
      color: "#ffffff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${BASE_URL}/api/patterns/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Preset Deleted Successfully");
          setPatterns((prev) => prev.filter((p) => p._id !== id));
          if (selectedId === id) {
            setSelectedId(null);
            onSelect(null);
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete preset");
        }
      }
    });
  };

  if (isCreating) {
    return (
      <div className="animate-fade-in-up">
        <PatternForm
          editingPattern={editingPattern}
          onSuccess={() => {
            setIsCreating(false);
            setEditingPattern(null);
            fetchPatterns();
          }}
          onClose={() => {
            setIsCreating(false);
            setEditingPattern(null);
          }}
          preFilledGrade={grade}
          preFilledSubject={subject}
          isUserMode={true}
          userSelectedTopics={selectedTopics}
        />
      </div>
    );
  }

  if (loading)
    return (
      <Loader fullScreen={false} text={`Loading Patterns for ${grade}...`} />
    );
  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        <FaExclamationCircle className="text-4xl mb-3 mx-auto" />{" "}
        <p className="font-bold">{error}</p>
        <button
          onClick={fetchPatterns}
          className="mt-3 px-4 py-2 bg-red-500/10 rounded-lg text-red-500"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 animate-fade-in-up">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-extrabold text-main mb-2">
          Choose Paper Pattern
        </h3>
        <p className="text-muted">
          Showing patterns suitable for:{" "}
          <span className="bg-pill-bg text-main px-2 py-1 rounded-md text-xs font-bold uppercase">
            {syllabusType === "FULL_BOOK"
              ? "Full Syllabus"
              : "Selected Chapters"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Create Custom Card */}
        <div
          onClick={() => setIsCreating(true)}
          className="bg-bg-body border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-50 hover:bg-accent-1/5 hover:border-accent-1 hover:-translate-y-1 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-accent-1/10 text-accent-1 flex items-center justify-center text-3xl mb-4 group-hover:bg-accent-1 group-hover:text-white transition-all">
            <FaPlusCircle />
          </div>
          <h4 className="font-bold text-main mb-2">Create Custom</h4>
          <p className="text-xs text-muted">
            Define your own sections & marks manually.
          </p>
        </div>

        {filteredPatterns.length > 0 ? (
          filteredPatterns.map((p) => {
            const isSelected = selectedId === p._id;
            const isExpanded = expandedId === p._id;
            const categoryLabel = p.category
              ? p.category.replace("_", " ")
              : "GENERAL";

            return (
              <div
                key={p._id}
                onClick={() => handleCardClick(p)}
                className={`relative bg-card border rounded-2xl p-5 pt-12 cursor-pointer transition-all duration-300 ${isSelected ? "border-accent-1 bg-accent-1/5 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]" : "border-border hover:border-accent-1/50 hover:shadow-lg hover:-translate-y-1"}`}
              >
                {isSelected && (
                  <div className="absolute top-4 left-4 text-accent-1 text-xl">
                    <FaCheckCircle />
                  </div>
                )}

                <div
                  className={`absolute top-4 flex items-center gap-2 ${isSelected ? "left-12" : "left-4"}`}
                >
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${p.category === "FULL_BOOK" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}
                  >
                    {categoryLabel}
                  </span>
                  {p.longQAttemptCount > 0 && (
                    <span className="bg-pill-bg text-muted border border-border px-2 py-1 rounded-full text-[10px] font-bold">
                      Complex Long
                    </span>
                  )}
                </div>

                {!p.isSystemPreset && (
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPattern(p);
                        setIsCreating(true);
                      }}
                      className="p-1.5 bg-bg-body text-muted hover:text-blue-500 rounded-md border border-border hover:bg-blue-500/10 transition-colors"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, p._id)}
                      className="p-1.5 bg-bg-body text-muted hover:text-red-500 rounded-md border border-border hover:bg-red-500/10 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                )}

                <h4 className="text-lg font-bold text-main mt-2 mb-3">
                  {p.name || p.presetName}
                </h4>

                <div className="flex gap-3 mb-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-pill-bg px-2.5 py-1 rounded-md text-main border border-border">
                    <FaStar className="text-yellow-500" /> {p.totalMarks} Marks
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-pill-bg px-2.5 py-1 rounded-md text-main border border-border">
                    <FaClock className="text-accent-1" /> {p.timeAllowed}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : p._id);
                  }}
                  className="w-full py-2 bg-bg-body border border-border rounded-lg text-xs font-bold text-muted hover:text-main flex items-center justify-center gap-2 transition-colors"
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
                  <div className="mt-4 pt-4 border-t border-dashed border-border animate-fade-in">
                    <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr] gap-2 text-[10px] font-extrabold text-muted uppercase border-b border-border pb-2 mb-2">
                      <span>Section</span>
                      <span>Type</span>
                      <span>Qs</span>
                      <span className="text-right">Marks</span>
                    </div>
                    {p.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr] gap-2 text-xs py-1.5 items-center border-b border-border/50 last:border-0"
                      >
                        <span className="font-semibold text-main truncate d-flex flex-col">
                          {sec.sectionTitle || `Section ${idx + 1}`}
                          <div className="flex gap-1 mt-0.5">
                            {sec.hasParts && (
                              <span className="bg-yellow-500/10 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded">
                                Parts
                              </span>
                            )}
                            {sec.isCompulsory && (
                              <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <FaLock size={8} /> Compulsory
                              </span>
                            )}
                          </div>
                        </span>
                        <span className="text-muted capitalize truncate">
                          {sec.questionType}
                        </span>
                        <span className="text-main font-medium">
                          {Number(sec.toAttempt)}/{Number(sec.totalQuestions)}
                        </span>
                        <span className="text-accent-1 font-bold text-right">
                          {Number(sec.toAttempt) * Number(sec.marksPerQuestion)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center p-10 bg-card rounded-2xl border border-border">
            <FaFilter className="text-4xl text-muted opacity-50 mx-auto mb-3" />
            <p className="text-main font-bold">No matching patterns found.</p>
            <p className="text-sm text-muted">
              Try creating a custom pattern for this syllabus type.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-end border-t border-border pt-6 pb-4">
        <button
          onClick={onNext}
          disabled={!selectedId}
          className="flex items-center gap-2 bg-linear-to-br from-accent-1 to-accent-2 text-white font-bold px-8 py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg shadow-accent-1/30 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
        >
          Next: Generate Paper <FaFileAlt />
        </button>
      </div>
    </div>
  );
};

export default PatternSelector;
