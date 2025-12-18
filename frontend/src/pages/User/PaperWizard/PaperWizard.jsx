import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// ✅ Import Steps
import ConfigStep from "./steps/ConfigStep";
import SelectionStep from "./steps/SelectionStep/SelectionStep"; // <--- New Import

import "./PaperWizard.css";

const PaperWizard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);

  // 1. Paper Configuration (Step 1 Data)
  const [paperConfig, setPaperConfig] = useState({
    grade: "",
    subject: "",
    paperTitle: "",
    medium: "both",
    mcqCount: "",
    shortCount: "",
    longCount: "",
  });

  // 2. Selected Questions (Step 2 Data)
  const [selectedData, setSelectedData] = useState({
    mcq: [],
    short: [],
    long: [],
  });

  const steps = [
    { id: 1, label: "Configuration" },
    { id: 2, label: "Questions" },
    { id: 3, label: "Preview" },
  ];

  // --- HANDLERS ---

  // Step 2 se jab Next click hoga
  const handleSelectionNext = (data) => {
    // data.selections mein { mcq: [...ids], short: [...ids] } hoga
    setSelectedData(data.selections);
    setCurrentStep(3); // Go to Preview
  };

  const handleStepClick = (stepId) => {
    if (stepId < currentStep) setCurrentStep(stepId);
  };

  const handleExitClick = () => setShowExitModal(true);
  const confirmExit = () => navigate("/user/dashboard");

  return (
    <div
      className={`wizard-container ${theme === "dark" ? "u-dark" : "u-light"}`}
    >
      {/* HEADER */}
      <header className="wizard-header">
        <div className="d-flex align-items-center gap-3">
          <button className="btn-exit" onClick={handleExitClick}>
            <FaArrowLeft /> Exit
          </button>
          <h3 className="wizard-title">Paper Generator</h3>
        </div>
        <button className="wizard-theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      {/* STEPPER */}
      <div className="wizard-stepper">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step-item ${currentStep >= step.id ? "active" : ""} ${
              currentStep === step.id ? "current" : ""
            } ${step.id < currentStep ? "clickable" : ""}`}
            onClick={() => handleStepClick(step.id)}
          >
            <div className="step-circle">
              {currentStep > step.id ? <FaCheckCircle /> : step.id}
            </div>
            <span className="step-label">{step.label}</span>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </div>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="wizard-content custom-scrollbar">
        {/* STEP 1: CONFIG */}
        {currentStep === 1 && (
          <ConfigStep
            config={paperConfig}
            setConfig={setPaperConfig}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 2: SELECTION (✅ Connected Now) */}
        {currentStep === 2 && (
          <SelectionStep
            config={paperConfig} // Pattern limits k liye
            setConfig={setPaperConfig} // Pattern Modal update k liye
            onNext={handleSelectionNext}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* STEP 3: PREVIEW (Placeholder) */}
        {currentStep === 3 && (
          <div className="text-center p-5">
            <h4 style={{ color: "var(--u-text-main)" }}>
              Final Preview Coming Soon...
            </h4>
            <p style={{ color: "var(--u-text-muted)" }}>
              Selected: {selectedData.mcq.length} MCQs,{" "}
              {selectedData.short.length} Short
            </p>
            <button className="btn-exit mt-3" onClick={() => setCurrentStep(2)}>
              Back to Selection
            </button>
          </div>
        )}
      </div>

      {/* EXIT MODAL */}
      {showExitModal && (
        <div className="wizard-modal-overlay">
          <div className="wizard-modal-box">
            <h3 className="wm-title">Exit Generator?</h3>
            <p className="wm-msg">
              Your current progress will be lost. Are you sure?
            </p>
            <div className="wm-actions">
              <button
                className="wm-btn wm-cancel"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </button>
              <button className="wm-btn wm-confirm" onClick={confirmExit}>
                Exit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperWizard;
