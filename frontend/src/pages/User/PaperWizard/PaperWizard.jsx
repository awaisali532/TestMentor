import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChevronRight,
  FaTimes,
  FaExclamationTriangle,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// Child Components
import ClassSelector from "../../../components/PaperGeneration/ClassSelector/ClassSelector";
import SubjectSelector from "../../../components/PaperGeneration/SubjectSelector/SubjectSelector";
import "./PaperWizard.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // --- STATE ---
  const [step, setStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);

  const [paperData, setPaperData] = useState({
    grade: "",
    subject: "",
    topics: [],
    chapters: [],
  });

  // --- HANDLERS ---

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate("/user/dashboard");
  };

  const goToStep = (targetStep) => {
    if (targetStep < step) setStep(targetStep);
  };

  const handleClassSelect = (selectedGrade) => {
    setPaperData({ ...paperData, grade: selectedGrade });
    setStep(2);
  };

  // ✅ ERROR FIX 1: Ye function missing tha, ab add kar diya hai
  const handleSubjectSelect = (selectedSubject) => {
    setPaperData({ ...paperData, subject: selectedSubject });
    setStep(3); // Go to next step
  };

  return (
    <div
      className={`pw-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      {/* --- HEADER --- */}
      <header className="pw-header">
        {/* Breadcrumbs */}
        <div className="pw-breadcrumb">
          <div
            className="crumb-item clickable"
            onClick={handleExitClick}
            title="Exit"
          >
            <FaHome />
          </div>

          <FaChevronRight className="crumb-separator" />
          <div
            className={`crumb-item ${step === 1 ? "active" : "clickable"}`}
            onClick={() => goToStep(1)}
          >
            {paperData.grade || "Select Class"}
          </div>

          {/* ✅ ERROR FIX 2: Yahan se SubjectSelector hata diya (Header me nahi ana chahiye) */}
          {step >= 2 && (
            <>
              <FaChevronRight className="crumb-separator" />
              <div
                className={`crumb-item ${step === 2 ? "active" : "clickable"}`}
                onClick={() => goToStep(2)}
              >
                {paperData.subject || "Select Subject"}
              </div>
            </>
          )}

          {step >= 3 && (
            <>
              <FaChevronRight className="crumb-separator" />
              <div className={`crumb-item ${step === 3 ? "active" : ""}`}>
                Select Syllabus
              </div>
            </>
          )}
        </div>

        {/* --- ACTIONS --- */}
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

          <button className="pw-close-btn" onClick={handleExitClick}>
            <FaTimes /> Exit
          </button>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="pw-content">
        {/* Step 1: Class Selection */}
        {step === 1 && (
          <div className="fade-in">
            <ClassSelector
              selectedClass={paperData.grade}
              onSelect={handleClassSelect}
            />
          </div>
        )}

        {/* Step 2: Subject Selection (✅ Correct Placement) */}
        {step === 2 && (
          <div className="fade-in">
            <SubjectSelector
              selectedClass={paperData.grade}
              onSelect={handleSubjectSelect}
            />
          </div>
        )}

        {/* Step 3: Syllabus (Coming Soon) */}
        {step === 3 && (
          <div className="fade-in p-5 text-center">
            Syllabus Selector Coming Soon...
          </div>
        )}
      </div>

      {/* --- EXIT MODAL --- */}
      {showExitModal && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-box">
            <div className="pw-modal-icon">
              <FaExclamationTriangle />
            </div>
            <h3 className="pw-modal-title">Exit Wizard?</h3>
            <p className="pw-modal-desc">
              Are you sure you want to leave? Your current progress will be
              lost.
            </p>
            <div className="pw-modal-actions">
              <button
                className="pw-btn-cancel"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </button>
              <button className="pw-btn-confirm" onClick={confirmExit}>
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperWizard;
