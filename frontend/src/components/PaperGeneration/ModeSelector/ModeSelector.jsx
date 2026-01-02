import React, { useState } from "react";
import {
  FaHandPointer,
  FaRobot,
  FaArrowLeft,
  FaBolt,
  FaLayerGroup,
  FaTachometerAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import ConfirmationModal from "../../common/ConfirmationModal/ConfirmationModal";
import "./ModeSelector.css";

const ModeSelector = ({ onSelect, onBack }) => {
  const [activeMode, setActiveMode] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Expanded Sources List
  const ALL_SOURCES = [
    { val: "TEXT", label: "Text Book Content" },
    { val: "EXERCISE", label: "Exercise Questions" },
    { val: "EXAMPLE", label: "Examples" },
    { val: "NUMERICAL", label: "Numericals" },
    { val: "REVIEW", label: "Review Questions" },
    { val: "CONCEPTUAL", label: "Conceptual" },
    { val: "PAST_PAPERS", label: "Past Papers" },
  ];

  const [autoConfig, setAutoConfig] = useState({
    difficulties: ["EASY", "MEDIUM", "HARD"],
    categories: ALL_SOURCES.map((s) => s.val),
  });

  // --- HANDLERS ---

  const handleManualClick = () => {
    setActiveMode("MANUAL");
    // ✅ Date removed, only passing mode
    onSelect("MANUAL", null);
  };

  const handleAutoClick = () => {
    if (activeMode === "AUTO") {
      setActiveMode(null);
    } else {
      setActiveMode("AUTO");
    }
  };

  const toggleDifficulty = (diff) => {
    setAutoConfig((prev) => {
      const exists = prev.difficulties.includes(diff);
      const updated = exists
        ? prev.difficulties.filter((d) => d !== diff)
        : [...prev.difficulties, diff];
      return { ...prev, difficulties: updated };
    });
  };

  const toggleCategory = (cat) => {
    setAutoConfig((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  const handleGenerate = () => {
    if (autoConfig.difficulties.length === 0)
      return toast.error("Select at least one difficulty level");
    if (autoConfig.categories.length === 0)
      return toast.error("Select at least one source");

    // ✅ Date removed, only passing config
    onSelect("AUTO", autoConfig);
  };

  const handleBack = () => setShowConfirm(true);

  const getDiffClass = (diff) => {
    if (diff === "EASY") return "diff-easy";
    if (diff === "MEDIUM") return "diff-medium";
    if (diff === "HARD") return "diff-hard";
    return "";
  };

  return (
    <div className="ms-container">
      <h2 className="ms-title">Select Generation Method</h2>
      <p className="ms-subtitle">Choose how you want to create the paper.</p>

      <div className="ms-grid">
        {/* MANUAL CARD */}
        <div
          className={`ms-card manual-card ${
            activeMode === "AUTO" ? "dimmed" : ""
          }`}
          onClick={handleManualClick}
        >
          <div className="icon-bg manual-icon-bg">
            <FaHandPointer className="ms-icon manual-icon" />
          </div>
          <h4>Manual Selection</h4>
          <p>Pick questions one-by-one. Full control.</p>
        </div>

        {/* AUTO CARD */}
        <div
          className={`ms-card auto-card ${
            activeMode === "AUTO" ? "active" : ""
          } ${activeMode === "MANUAL" ? "dimmed" : ""}`}
          onClick={handleAutoClick}
        >
          <div className="icon-bg auto-icon-bg">
            <FaRobot className="ms-icon auto-icon" />
          </div>
          <h4>Auto Generator</h4>
          <p>Let AI select questions instantly.</p>
        </div>

        {/* --- AUTO SETTINGS PANEL --- */}
        {activeMode === "AUTO" && (
          <div className="ms-settings-panel">
            {/* Difficulty Selection */}
            <div className="ms-section-title">
              <FaTachometerAlt className="text-accent" /> Select Difficulty Mix
            </div>
            <div className="ms-options-grid">
              {["EASY", "MEDIUM", "HARD"].map((diff) => (
                <div
                  key={diff}
                  className={`ms-checkbox-tile ${getDiffClass(diff)} ${
                    autoConfig.difficulties.includes(diff) ? "checked" : ""
                  }`}
                  onClick={() => toggleDifficulty(diff)}
                >
                  <input
                    type="checkbox"
                    checked={autoConfig.difficulties.includes(diff)}
                    readOnly
                    className="ms-cb"
                  />
                  <span>{diff.charAt(0) + diff.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>

            {/* Source Selection */}
            <div className="ms-section-title">
              <FaLayerGroup className="text-accent" /> Select Question Sources
            </div>
            <div className="ms-options-grid sources-grid">
              {ALL_SOURCES.map((src) => (
                <div
                  key={src.val}
                  className={`ms-checkbox-tile source-tile ${
                    autoConfig.categories.includes(src.val) ? "checked" : ""
                  }`}
                  onClick={() => toggleCategory(src.val)}
                >
                  <input
                    type="checkbox"
                    checked={autoConfig.categories.includes(src.val)}
                    readOnly
                    className="ms-cb"
                  />
                  <span>{src.label}</span>
                </div>
              ))}
            </div>

            <button
              className="btn-generate w-100 justify-content-center"
              onClick={handleGenerate}
            >
              <FaBolt /> Generate Paper Now
            </button>
          </div>
        )}
      </div>

      <div className="ms-actions">
        <button className="btn-back" onClick={handleBack}>
          <FaArrowLeft className="me-2" /> Back to Pattern
        </button>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onBack}
        title="Go Back?"
        message="Your selections will be reset."
        confirmText="Yes, Go Back"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ModeSelector;
