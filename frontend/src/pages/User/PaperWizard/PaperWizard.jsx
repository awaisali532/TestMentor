import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation Import
import { FaExclamationTriangle } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// Child Components (Imports same rahengi)
import WizardBreadCrumb from "../../../components/PaperGeneration/WizardBreadcrumb/WizardBreadcrumb";
import ClassSelector from "../../../components/PaperGeneration/ClassSelector/ClassSelector";
import SubjectSelector from "../../../components/PaperGeneration/SubjectSelector/SubjectSelector";
import SyllabusSelector from "../../../components/PaperGeneration/SyllabusSelector/SyllabusSelector";
import PatternSelector from "../../../components/PaperGeneration/PatternSelector/PatternSelector";
import PatternForm from "../../Admin/PaperPatterns/PatternForm";
import ModeSelector from "../../../components/PaperGeneration/ModeSelector/ModeSelector";
import "./PaperWizard.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Location hook
  const { theme } = useTheme();

  // --- 1. DEFAULT EMPTY STATE ---
  const defaultPaperData = {
    grade: "",
    subject: "",
    topics: [],
    syllabusLabel: "Select Syllabus",
    selectedPattern: null,
    mode: null,
    autoSettings: null,
  };

  // --- 2. STATE INITIALIZATION ---
  const [step, setStep] = useState(1);
  const [paperData, setPaperData] = useState(defaultPaperData);

  // ✅ 3. RESET LOGIC (Fresh Start vs Back from Maker)
  useEffect(() => {
    // Check karein agr user PaperMaker se 'Cancel' kr k aya hai
    if (location.state?.keepData) {
      // LocalStorage se data uthao (Restore session)
      const savedStep = localStorage.getItem("pw_step");
      const savedData = localStorage.getItem("pw_data");

      if (savedData) setPaperData(JSON.parse(savedData));
      // Hamesha Step 5 (Mode Selector) pr le jao agr wapis aya hai
      if (savedStep) setStep(5);
    } else {
      // Agar New aya hai -> Sab Clean kr do (Fresh Start)
      localStorage.removeItem("pw_step");
      localStorage.removeItem("pw_data");
      setStep(1);
      setPaperData(defaultPaperData);
    }
  }, []); // Run only once on mount

  // --- 4. PERSIST DATA (Save on change) ---
  useEffect(() => {
    // Sirf tab save kro jab data exist krta ho (taake empty state save na ho jaye start ma)
    if (paperData.grade) {
      localStorage.setItem("pw_step", step);
      localStorage.setItem("pw_data", JSON.stringify(paperData));
    }
  }, [step, paperData]);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  // --- REST OF THE HANDLERS (Copy Paste existing logic below) ---

  useEffect(() => {
    if (step > 1 && !paperData.grade) setStep(1);
    if (step > 2 && !paperData.subject) setStep(2);
  }, [step, paperData]);

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

  const handlePatternConfirm = () => {
    setStep(5);
  };

  const handleModeSelect = (mode, settings) => {
    const finalData = { ...paperData, mode, autoSettings: settings };
    setPaperData(finalData);

    if (mode === "MANUAL") {
      navigate("/user/paper-maker", { state: finalData });
    } else {
      console.log("Auto Generation:", settings);
      alert("Auto Gen Coming Soon");
    }
  };

  // Custom Pattern Logic
  const handleCreateCustom = () => {
    setEditingPreset(null);
    setShowCustomForm(true);
  };

  const handleEditCustom = (pattern) => {
    setEditingPreset(pattern);
    setShowCustomForm(true);
  };

  const handleCustomFormSave = (savedPattern) => {
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

        {step === 4 && (
          <div className="fade-in">
            {showCustomForm ? (
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
              <PatternSelector
                grade={paperData.grade}
                subject={paperData.subject}
                onSelect={handlePatternSelect}
                onNext={handlePatternConfirm}
                onCreateCustom={handleCreateCustom}
                onEdit={handleEditCustom}
              />
            )}
          </div>
        )}

        {step === 5 && (
          <div className="fade-in">
            <ModeSelector
              onSelect={handleModeSelect}
              onBack={() => setStep(4)}
            />
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
