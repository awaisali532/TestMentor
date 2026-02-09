import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext.jsx";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Common Components
import TMLoader from "../../../components/common/TMLoader/TMLoader.jsx";
import UpgradeModal from "../../../components/common/UpgradeModal/UpgradeModal.jsx";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Child Components
import WizardBreadCrumb from "../../../components/PaperGeneration/WizardBreadcrumb/WizardBreadcrumb.jsx";
import ClassSelector from "../../../components/PaperGeneration/ClassSelector/ClassSelector.jsx";
import SubjectSelector from "../../../components/PaperGeneration/SubjectSelector/SubjectSelector.jsx";
import SyllabusSelector from "../../../components/PaperGeneration/SyllabusSelector/SyllabusSelector.jsx";
import PatternSelector from "../../../components/PaperGeneration/PatternSelector/PatternSelector.jsx";
import PatternForm from "../../Admin/PaperPatterns/PatternForm.jsx";
import ModeSelector from "../../../components/PaperGeneration/ModeSelector/ModeSelector.jsx";
import "./PaperGeneration.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- DEFAULT STATE ---
  const defaultPaperData = {
    grade: "",
    subject: "",
    topics: [],
    syllabusLabel: "Select Syllabus",
    syllabusType: "CHAPTERS",
    selectedPattern: null,
    mode: null,
    autoSettings: null,
    examLabel: "",
    examDate: new Date(),
  };

  const [step, setStep] = useState(1);
  const [paperData, setPaperData] = useState(defaultPaperData);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // --- RESET & PERSIST LOGIC ---
  useEffect(() => {
    if (location.state?.keepData) {
      const savedStep = localStorage.getItem("pw_step");
      const savedData = localStorage.getItem("pw_data");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.examDate) parsed.examDate = new Date(parsed.examDate);
        setPaperData(parsed);
      }
      if (savedStep) setStep(5);
    } else {
      localStorage.removeItem("pw_step");
      localStorage.removeItem("pw_data");
      setStep(1);
      setPaperData(defaultPaperData);
    }
  }, []);

  useEffect(() => {
    if (paperData.grade) {
      localStorage.setItem("pw_step", step);
      localStorage.setItem("pw_data", JSON.stringify(paperData));
    }
  }, [step, paperData]);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  // --- NAVIGATION HANDLERS ---
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

  const handleClassSelect = (grade) => {
    setPaperData({ ...paperData, grade });
    setStep(2);
  };
  const handleSubjectSelect = (subject) => {
    setPaperData({ ...paperData, subject });
    setStep(3);
  };

  const handleSyllabusSelect = (topics, label, type) => {
    setPaperData({
      ...paperData,
      topics,
      syllabusLabel: label || "Select Syllabus",
      syllabusType: type || "CHAPTERS",
    });
  };

  const handlePatternSelect = (pattern) =>
    setPaperData({ ...paperData, selectedPattern: pattern });
  const handlePatternConfirm = () => setStep(5);
  const handleCreateCustom = () => {
    setEditingPreset(null);
    setShowCustomForm(true);
  };
  const handleEditCustom = (pattern) => {
    setEditingPreset(pattern);
    setShowCustomForm(true);
  };
  const handleCustomFormSave = (pattern) => {
    setPaperData({ ...paperData, selectedPattern: pattern });
    setShowCustomForm(false);
    setEditingPreset(null);
  };

  // ============================================================
  // 🔥 UPDATED MODE SELECTION (Connects to AutoPaper)
  // ============================================================
  const handleModeSelect = async (mode, settings) => {
    const finalData = { ...paperData, mode, autoSettings: settings };
    setPaperData(finalData);
    setWizardLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 1. TRACK USAGE (Check Limits for both modes)
      await axios.post(
        `${BASE_URL}/api/usage/track-paper`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 2. NAVIGATE BASED ON MODE
      if (mode === "MANUAL") {
        setTimeout(() => {
          navigate("/user/manual-maker", { state: finalData });
        }, 800);
      } else if (mode === "AUTO") {
        // ✅ Prepare Payload for AutoPaper Engine
        const paperPayload = {
          grade: paperData.grade,
          subject: paperData.subject,
          topics: paperData.topics,
          selectedPattern: paperData.selectedPattern,
          title: paperData.examLabel || "Untitled Paper",
          examDate: paperData.examDate,
          examLabel: paperData.examLabel,
          syllabusLabel: paperData.syllabusLabel,
          autoConfig: settings, // Contains { difficulties: [...] }
        };

        console.log("🚀 Launching Auto Engine with:", paperPayload);

        setTimeout(() => {
          navigate("/user/auto-paper", { state: paperPayload });
        }, 800);
      }
    } catch (error) {
      setWizardLoading(false);
      console.error("Tracking Error:", error);
      if (error.response && error.response.status === 403) {
        setShowUpgradeModal(true);
      } else {
        toast.error("Limit reached or network error. Please check your plan.");
      }
    }
  };

  return (
    <div
      className={`pw-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      <Toaster position="top-right" />

      {wizardLoading && (
        <TMLoader message="Verifying limits & preparing workspace..." />
      )}

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
                selectedTopics={paperData.topics}
                syllabusType={paperData.syllabusType}
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
            <div className="pw-final-card">
              <h4 className="pw-final-title">Final Details</h4>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
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
                <div className="col-md-4">
                  <label className="pw-label">
                    <FaCalendarAlt className="me-2 text-accent" /> Exam Date
                  </label>
                  <div className="pw-datepicker-container">
                    <DatePicker
                      selected={paperData.examDate}
                      onChange={(date) =>
                        setPaperData({ ...paperData, examDate: date })
                      }
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      className="pw-input date-input"
                      placeholderText="Select Date"
                      onChangeRaw={(e) => e.preventDefault()}
                      onKeyDown={(e) => e.preventDefault()}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => navigate("/pricing")}
      />
    </div>
  );
};

export default PaperWizard;
