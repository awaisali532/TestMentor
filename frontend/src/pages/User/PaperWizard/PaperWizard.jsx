import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// Child Components
import WizardBreadCrumb from "../../../components/PaperGeneration/WizardBreadCrumb/WizardBreadCrumb"; // ✅ Import Added
import ClassSelector from "../../../components/PaperGeneration/ClassSelector/ClassSelector";
import SubjectSelector from "../../../components/PaperGeneration/SubjectSelector/SubjectSelector";
import SyllabusSelector from "../../../components/PaperGeneration/SyllabusSelector/SyllabusSelector";
import "./PaperWizard.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // --- STATE ---
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("pw_step");
    return savedStep ? parseInt(savedStep) : 1;
  });

  const [paperData, setPaperData] = useState(() => {
    const savedData = localStorage.getItem("pw_data");
    const savedStep = localStorage.getItem("pw_step");

    if (savedData && savedStep) {
      const parsedData = JSON.parse(savedData);
      const currentStep = parseInt(savedStep);

      // Reset Logic on Refresh
      if (currentStep === 3) return { ...parsedData, topics: [] };
      if (currentStep === 2) return { ...parsedData, subject: "", topics: [] };

      return parsedData;
    }

    return { grade: "", subject: "", topics: [], chapters: [] };
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem("pw_step", step);
    localStorage.setItem("pw_data", JSON.stringify(paperData));
  }, [step, paperData]);

  useEffect(() => {
    if (step > 1 && !paperData.grade) setStep(1);
    if (step > 2 && !paperData.subject) setStep(2);
  }, [step, paperData]);

  // --- HANDLERS ---
  const handleExitClick = () => setShowExitModal(true);

  const confirmExit = () => {
    localStorage.removeItem("pw_step");
    localStorage.removeItem("pw_data");
    navigate("/user/dashboard");
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

  return (
    <div
      className={`pw-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      {/* ✅ NEW: Using the Component we just filled */}
      <WizardBreadCrumb
        step={step}
        setStep={setStep} // Passing function to allow clicking on crumbs
        paperData={paperData}
        onExit={handleExitClick}
      />

      {/* --- CONTENT AREA --- */}
      <div className="pw-content">
        {step === 1 && (
          <div className="fade-in">
            <ClassSelector
              selectedClass={paperData.grade}
              onSelect={handleClassSelect}
            />
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <SubjectSelector
              selectedClass={paperData.grade}
              onSelect={handleSubjectSelect}
            />
          </div>
        )}

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
            <p className="pw-modal-desc">Your progress will be lost.</p>
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
