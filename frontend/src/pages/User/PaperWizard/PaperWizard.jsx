import React, { useState, useEffect } from "react";
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
import SyllabusSelector from "../../../components/PaperGeneration/SyllabusSelector/SyllabusSelector";
import "./PaperWizard.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // --- 1. INITIALIZE STATE FROM LOCAL STORAGE ---

  // Step State Load Logic
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("pw_step");
    return savedStep ? parseInt(savedStep) : 1;
  });

  // Data State Load Logic (With Reset Condition)
  const [paperData, setPaperData] = useState(() => {
    const savedData = localStorage.getItem("pw_data");
    const savedStep = localStorage.getItem("pw_step");

    if (savedData && savedStep) {
      const parsedData = JSON.parse(savedData);
      const currentStep = parseInt(savedStep);

      // --- RESET LOGIC ON REFRESH ---

      // Agar Step 3 (Syllabus) par refresh kia:
      // Grade aur Subject rakho, Topics khali kar do
      if (currentStep === 3) {
        return { ...parsedData, topics: [] };
      }

      // Agar Step 2 (Subject) par refresh kia:
      // Grade rakho, Subject khali kar do
      if (currentStep === 2) {
        return { ...parsedData, subject: "", topics: [] };
      }

      // Agar Step 4 par hain to sab kuch rakho (Pattern reset krna ho to wo bhi kr skte hain)
      return parsedData;
    }

    // Default Empty State
    return {
      grade: "",
      subject: "",
      topics: [],
      chapters: [],
    };
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // --- 2. SAVE TO LOCAL STORAGE ON CHANGE ---
  useEffect(() => {
    localStorage.setItem("pw_step", step);
    localStorage.setItem("pw_data", JSON.stringify(paperData));
  }, [step, paperData]);

  // --- HANDLERS ---

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  // Clear Storage on Exit
  const confirmExit = () => {
    localStorage.removeItem("pw_step");
    localStorage.removeItem("pw_data");
    navigate("/user/dashboard");
  };

  const goToStep = (targetStep) => {
    if (targetStep < step) {
      // Jab user piche jaye, to agla data clear krna acha UX hai,
      // lekin aapki requirement ke mutabiq hum sirf step change kr rahe hain.
      setStep(targetStep);
    }
  };

  const handleClassSelect = (selectedGrade) => {
    setPaperData({ ...paperData, grade: selectedGrade });
    setStep(2);
  };

  const handleSubjectSelect = (selectedSubject) => {
    setPaperData({ ...paperData, subject: selectedSubject });
    setStep(3);
  };

  const handleSyllabusSelect = (selectedIds) => {
    setPaperData({ ...paperData, topics: selectedIds });
  };

  // --- SAFETY CHECK ---
  // Agar user direct Step 3 par aa jaye bina Grade select kiye (storage delete hone par), to wapis bhejo
  useEffect(() => {
    if (step > 1 && !paperData.grade) {
      setStep(1);
    }
    if (step > 2 && !paperData.subject) {
      setStep(2);
    }
  }, [step, paperData]);

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

          {step >= 4 && (
            <>
              <FaChevronRight className="crumb-separator" />
              <div className={`crumb-item ${step === 4 ? "active" : ""}`}>
                Paper Pattern
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

      {/* --- CONTENT AREA --- */}
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

        {/* Step 2: Subject Selection */}
        {step === 2 && (
          <div className="fade-in">
            <SubjectSelector
              selectedClass={paperData.grade}
              onSelect={handleSubjectSelect}
            />
          </div>
        )}

        {/* Step 3: Syllabus Selection */}
        {step === 3 && (
          <div className="fade-in">
            <SyllabusSelector
              selectedClass={paperData.grade}
              selectedSubject={paperData.subject}
              onSelectionChange={handleSyllabusSelect}
              onNext={() => setStep(4)}
            />
          </div>
        )}

        {/* Step 4: Paper Pattern */}
        {step === 4 && (
          <div className="fade-in p-5 text-center">
            <h2>Paper Pattern Settings</h2>
            <p>Coming Soon...</p>
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
