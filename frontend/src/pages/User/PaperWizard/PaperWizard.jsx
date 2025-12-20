import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// Child Components
import WizardBreadCrumb from "../../../components/PaperGeneration/WizardBreadcrumb/WizardBreadcrumb";
import ClassSelector from "../../../components/PaperGeneration/ClassSelector/ClassSelector";
import SubjectSelector from "../../../components/PaperGeneration/SubjectSelector/SubjectSelector";
import SyllabusSelector from "../../../components/PaperGeneration/SyllabusSelector/SyllabusSelector";
import PatternSelector from "../../../components/PaperGeneration/PatternSelector/PatternSelector";
import PatternForm from "../../Admin/PaperPatterns/PatternForm"; // Reusing Admin Form
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

      if (currentStep === 4) return { ...parsedData, selectedPattern: null };
      if (currentStep === 3) return { ...parsedData, topics: [] };
      if (currentStep === 2) return { ...parsedData, subject: "", topics: [] };

      return parsedData;
    }
    return {
      grade: "",
      subject: "",
      topics: [],
      syllabusLabel: "Select Syllabus",
      chapters: [],
      selectedPattern: null,
    };
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // ✅ NEW STATES FOR CUSTOM FORM
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

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

  const handleSyllabusSelect = (selectedIds, label) => {
    setPaperData({
      ...paperData,
      topics: selectedIds,
      syllabusLabel: label || "Select Syllabus",
    });
  };

  const handlePatternSelect = (pattern) => {
    setPaperData({ ...paperData, selectedPattern: pattern });
  };

  const handleGenerateClick = () => {
    console.log("FINAL PAPER DATA:", paperData);
    alert("Ready to Generate! (API Integration Next Step)");
  };

  // ✅ CUSTOM PATTERN HANDLERS
  const handleCreateCustom = () => {
    setEditingPreset(null); // Clear editing state for new creation
    setShowCustomForm(true);
  };

  const handleEditCustom = (pattern) => {
    setEditingPreset(pattern); // Load existing data
    setShowCustomForm(true);
  };

  const handleCustomFormSave = (savedPattern) => {
    // Save hone k baad usey select bhi kar lo
    setPaperData({ ...paperData, selectedPattern: savedPattern });
    setShowCustomForm(false);
    setEditingPreset(null);
  };

  return (
    <div
      className={`pw-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      <WizardBreadCrumb
        step={step}
        setStep={setStep}
        paperData={paperData}
        onExit={handleExitClick}
      />

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

        {/* ✅ STEP 4 LOGIC UPDATED */}
        {step === 4 && (
          <div className="fade-in">
            {showCustomForm ? (
              // Show Form if Create/Edit mode is active
              <PatternForm
                onClose={() => {
                  setShowCustomForm(false);
                  setEditingPreset(null);
                }}
                initialData={
                  editingPreset || {
                    presetName: `${paperData.grade} ${paperData.subject} Custom`,
                    gradeLevel: paperData.grade,
                    subjects: paperData.subject,
                    type: "CUSTOM",
                    totalMarks: 50,
                    isSystemPreset: false,
                  }
                }
                isUserMode={true}
                onSuccess={handleCustomFormSave}
              />
            ) : (
              // Otherwise show Selector
              <PatternSelector
                grade={paperData.grade}
                subject={paperData.subject}
                onSelect={handlePatternSelect}
                onNext={handleGenerateClick}
                onCreateCustom={handleCreateCustom} // New
                onEdit={handleEditCustom} // New (For Edit)
              />
            )}
          </div>
        )}
      </div>

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
