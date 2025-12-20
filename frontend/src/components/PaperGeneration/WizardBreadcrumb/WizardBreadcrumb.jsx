import React from "react";
import { FaHome, FaChevronRight, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const WizardBreadCrumb = ({ step, setStep, paperData, onExit }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="pw-header">
      {/* Breadcrumbs Path */}
      <div className="pw-breadcrumb">
        {/* Home / Exit Icon */}
        <div
          className="crumb-item clickable"
          onClick={onExit}
          title="Exit Wizard"
        >
          <FaHome />
        </div>

        {/* Step 1: Grade */}
        <FaChevronRight className="crumb-separator" />
        <div
          className={`crumb-item ${step === 1 ? "active" : "clickable"}`}
          onClick={() => setStep(1)}
        >
          {paperData.grade || "Select Class"}
        </div>

        {/* Step 2: Subject */}
        {step >= 2 && (
          <>
            <FaChevronRight className="crumb-separator" />
            <div
              className={`crumb-item ${step === 2 ? "active" : "clickable"}`}
              onClick={() => setStep(2)}
            >
              {paperData.subject || "Select Subject"}
            </div>
          </>
        )}

        {/* Step 3: Syllabus (Dynamic Label) */}
        {step >= 3 && (
          <>
            <FaChevronRight className="crumb-separator" />
            <div
              className={`crumb-item ${step === 3 ? "active" : "clickable"}`}
              onClick={() => setStep(3)}
              title={paperData.syllabusLabel || "Select Syllabus"} // Tooltip for long text
            >
              <span className="crumb-text">
                {paperData.syllabusLabel || "Select Syllabus"}
              </span>
            </div>
          </>
        )}

        {/* Step 4: Pattern */}
        {step >= 4 && (
          <>
            <FaChevronRight className="crumb-separator" />
            <div className={`crumb-item ${step === 4 ? "active" : ""}`}>
              {paperData.selectedPattern?.presetName || "Paper Pattern"}
            </div>
          </>
        )}
      </div>

      {/* Actions (Theme + Exit) */}
      <div className="pw-actions">
        <button
          className="pw-theme-btn"
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button className="pw-close-btn" onClick={onExit}>
          <FaTimes /> Exit
        </button>
      </div>
    </header>
  );
};

export default WizardBreadCrumb;
