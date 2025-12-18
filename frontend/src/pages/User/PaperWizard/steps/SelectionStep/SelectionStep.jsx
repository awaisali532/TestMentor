import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaArrowRight, FaArrowLeft, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

// Components Imports (Updated Path)
import QuestionList from "./components/QuestionList/QuestionList";
import PatternModal from "./components/PatternModal/PatternModal";

import "./SelectionStep.css";

const SelectionStep = ({ config, setConfig, onNext, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("mcq");
  const [showPatternModal, setShowPatternModal] = useState(false);

  // Selection State (Store IDs)
  const [selections, setSelections] = useState({
    mcq: [],
    short: [],
    long: [],
  });

  // --- 1. FETCH QUESTIONS ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        // Backend API Call
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/filter`,
          {
            params: { grade: config.grade, subject: config.subject },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setQuestions(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load questions");
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [config.grade, config.subject]);

  // --- 2. TOGGLE SELECTION ---
  const toggleSelection = (qId) => {
    const type = activeTab; // Current Tab Logic
    const currentList = selections[type];
    const limit = parseInt(config[`${type}Count`] || 0);

    // Remove if exists
    if (currentList.includes(qId)) {
      setSelections({
        ...selections,
        [type]: currentList.filter((id) => id !== qId),
      });
    } else {
      // Add if limit not reached
      if (currentList.length >= limit) {
        toast.error(
          `Limit reached! You can only select ${limit} ${type.toUpperCase()}s.`
        );
        return;
      }
      setSelections({
        ...selections,
        [type]: [...currentList, qId],
      });
    }
  };

  // Filter Questions for Active Tab
  const filteredQuestions = questions.filter((q) => q.type === activeTab);

  if (loading)
    return (
      <div className="p-5 text-center text-muted">
        <FaSpinner className="icon-spin" /> Loading Questions...
      </div>
    );

  return (
    <div className="selection-container fade-in">
      {/* --- TOP BAR --- */}
      <div className="selection-header">
        <div className="stats-info">
          <span className="badge-class">{config.grade}</span>
          <span className="badge-subject">{config.subject}</span>
        </div>

        <div className="pattern-summary">
          <div className="p-item">
            MCQ:{" "}
            <b>
              {selections.mcq.length}/{config.mcqCount}
            </b>
          </div>
          <div className="p-item">
            Short:{" "}
            <b>
              {selections.short.length}/{config.shortCount}
            </b>
          </div>
          <div className="p-item">
            Long:{" "}
            <b>
              {selections.long.length}/{config.longCount}
            </b>
          </div>

          <button
            className="btn-edit-pattern"
            onClick={() => setShowPatternModal(true)}
          >
            <FaEdit /> Edit
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="selection-tabs">
        {["mcq", "short", "long"].map((type) => (
          <button
            key={type}
            className={`tab-btn ${activeTab === type ? "active" : ""} ${
              parseInt(config[`${type}Count`]) === 0 ? "disabled" : ""
            }`}
            onClick={() => setActiveTab(type)}
            disabled={parseInt(config[`${type}Count`]) === 0}
          >
            {type.toUpperCase()}
            <span className="tab-badge">
              {selections[type].length}/{config[`${type}Count`]}
            </span>
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="questions-area custom-scrollbar">
        {filteredQuestions.length > 0 ? (
          <QuestionList
            questions={filteredQuestions}
            selectedIds={selections[activeTab]}
            onToggle={toggleSelection}
          />
        ) : (
          <div className="empty-state">
            No {activeTab.toUpperCase()}s found for this subject.
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="selection-footer">
        <button className="btn-back" onClick={onBack}>
          <FaArrowLeft className="me-2" /> Back
        </button>

        <button className="btn-finish" onClick={() => onNext({ selections })}>
          Generate Paper <FaArrowRight className="ms-2" />
        </button>
      </div>

      {/* --- MODAL --- */}
      {showPatternModal && (
        <PatternModal
          config={config}
          setConfig={setConfig}
          onClose={() => setShowPatternModal(false)}
        />
      )}
    </div>
  );
};

export default SelectionStep;
