import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// ✅ Custom Loader
import TMLoader from "../../../components/common/TMLoader/TMLoader";

// Child Components
import WizardBreadCrumb from "../../../components/PaperGeneration/WizardBreadcrumb/WizardBreadcrumb";
import ClassSelector from "../../../components/PaperGeneration/ClassSelector/ClassSelector.jsx";
import SubjectSelector from "../../../components/PaperGeneration/SubjectSelector/SubjectSelector";
import SyllabusSelector from "../../../components/PaperGeneration/SyllabusSelector/SyllabusSelector";
import PatternSelector from "../../../components/PaperGeneration/PatternSelector/PatternSelector";
import PatternForm from "../../Admin/PaperPatterns/PatternForm";
import ModeSelector from "../../../components/PaperGeneration/ModeSelector/ModeSelector";
import "./PaperWizard.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // --- 1. DEFAULT STATE ---
  const defaultPaperData = {
    grade: "",
    subject: "",
    topics: [],
    syllabusLabel: "Select Syllabus",
    selectedPattern: null,
    mode: null,
    autoSettings: null,
    examLabel: "",
    examDate: "",
  };

  const [step, setStep] = useState(1);
  const [paperData, setPaperData] = useState(defaultPaperData);
  const [wizardLoading, setWizardLoading] = useState(false);

  // --- 2. GET TODAY'S DATE (For Validation) ---
  // Ye function aaj ki date nikalta hai YYYY-MM-DD format mein
  const getMinDate = () => {
    const today = new Date();
    // Local Timezone adjustment taake date accurate rahe
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- 3. RESET LOGIC ---
  useEffect(() => {
    if (location.state?.keepData) {
      const savedStep = localStorage.getItem("pw_step");
      const savedData = localStorage.getItem("pw_data");

      if (savedData) setPaperData(JSON.parse(savedData));
      if (savedStep) setStep(5);
    } else {
      localStorage.removeItem("pw_step");
      localStorage.removeItem("pw_data");
      setStep(1);
      setPaperData(defaultPaperData);
    }
  }, []);

  // --- 4. PERSIST DATA ---
  useEffect(() => {
    if (paperData.grade) {
      localStorage.setItem("pw_step", step);
      localStorage.setItem("pw_data", JSON.stringify(paperData));
    }
  }, [step, paperData]);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  // --- HANDLERS ---
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
      setWizardLoading(true);
      setTimeout(() => {
        navigate("/user/manual-maker", { state: finalData });
      }, 1500);
    } else {
      alert("Auto Gen Coming Soon");
    }
  };

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
      {wizardLoading && <TMLoader message="Preparing your workspace..." />}

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

        {/* ✅ STEP 5: FINALIZATION */}
        {step === 5 && (
          <div className="fade-in">
            <div className="pw-final-card">
              <h4 className="pw-final-title">Final Details</h4>

              <div className="row g-3">
                {/* 1. Exam Label Input */}
                <div className="col-md-7">
                  <label className="pw-label">
                    Exam Title <span>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="pw-input"
                    placeholder="e.g. Weekly Test #1"
                    value={paperData.examLabel}
                    onChange={(e) =>
                      setPaperData({ ...paperData, examLabel: e.target.value })
                    }
                  />
                </div>

                {/* 2. Exam Date Input */}
                <div className="col-md-5">
                  <label className="pw-label">
                    <FaCalendarAlt className="me-2" /> Exam Date
                  </label>
                  <input
                    type="date"
                    className="pw-input"
                    // ✅ THIS LINE DISABLES PAST DATES
                    min={getMinDate()}
                    value={paperData.examDate}
                    onChange={(e) =>
                      setPaperData({ ...paperData, examDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <p className="pw-info-text">
                Add these details to easily identify this paper later in "Saved
                Papers".
              </p>
            </div>

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
