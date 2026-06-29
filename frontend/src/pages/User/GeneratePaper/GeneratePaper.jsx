import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useTheme } from "../../../context/ThemeContext";

// Components
import Loader from "../../../components/ui/Loader";
import WizardBreadcrumb from "./components/WizardBreadcrumb";
import ClassSelector from "./components/ClassSelector";
import SubjectSelector from "./components/SubjectSelector";
import SyllabusSelector from "./components/SyllabusSelector";
import PatternSelector from "./components/PatternSelector";
import ModeSelector from "./components/ModeSelector";

const GeneratePaper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
    examDate: new Date().toISOString().split("T")[0],
  };

  const [step, setStep] = useState(1);
  const [paperData, setPaperData] = useState(defaultPaperData);
  const [wizardLoading, setWizardLoading] = useState(false);

  useEffect(() => {
    if (location.state?.keepData) {
      const savedStep = localStorage.getItem("pw_step");
      const savedData = localStorage.getItem("pw_data");
      if (savedData) setPaperData(JSON.parse(savedData));
      if (savedStep) setStep(5);
    } else {
      localStorage.removeItem("pw_step");
      localStorage.removeItem("pw_data");
    }
  }, []);

  useEffect(() => {
    if (paperData.grade) {
      localStorage.setItem("pw_step", step);
      localStorage.setItem("pw_data", JSON.stringify(paperData));
    }
  }, [step, paperData]);

  const handleExitClick = () => {
    Swal.fire({
      title: "Exit Wizard?",
      text: "Your progress will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Exit",
      background: "#0f172a",
      color: "#ffffff",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("pw_step");
        localStorage.removeItem("pw_data");
        navigate("/user/dashboard");
      }
    });
  };

  const handleModeSelect = async (mode, settings) => {
    const finalData = { ...paperData, mode, autoSettings: settings };
    setPaperData(finalData);
    setWizardLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/usage/track-paper`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (mode === "MANUAL") {
        setTimeout(
          () => navigate("/user/manual-maker", { state: finalData }),
          800,
        );
      } else {
        const paperPayload = {
          grade: paperData.grade,
          subject: paperData.subject,
          topics: paperData.topics,
          selectedPattern: paperData.selectedPattern,
          title: paperData.examLabel || "Untitled Paper",
          examDate: paperData.examDate,
          examLabel: paperData.examLabel,
          syllabusLabel: paperData.syllabusLabel,
          autoConfig: settings,
        };
        setTimeout(
          () => navigate("/user/auto-paper", { state: paperPayload }),
          800,
        );
      }
    } catch (error) {
      setWizardLoading(false);
      if (error.response?.status === 403)
        toast.error("Usage limit reached! Please upgrade your plan.");
      else toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative">
      {/* ✅ FIX: Forced CSS Injection for Date Picker Icon in Dark Mode */}
      <style>
        {`
          .tm-date-input::-webkit-calendar-picker-indicator {
            filter: ${theme === "dark" ? "invert(1) brightness(100%)" : "none"};
            cursor: pointer;
            opacity: 0.6;
          }
          .tm-date-input::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
        `}
      </style>

      {wizardLoading && (
        <Loader
          fullScreen={true}
          text="Verifying limits & preparing workspace..."
        />
      )}

      <WizardBreadcrumb
        step={step}
        setStep={setStep}
        paperData={paperData}
        onExit={handleExitClick}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {step === 1 && (
          <ClassSelector
            selectedClass={paperData.grade}
            onSelect={(grade) => {
              setPaperData({ ...paperData, grade });
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <SubjectSelector
            selectedClass={paperData.grade}
            onSelect={(subject) => {
              setPaperData({ ...paperData, subject });
              setStep(3);
            }}
          />
        )}
        {step === 3 && (
          <SyllabusSelector
            selectedClass={paperData.grade}
            selectedSubject={paperData.subject}
            selectedTopics={paperData.topics}
            onSelectionChange={(topics, label, type) =>
              setPaperData({
                ...paperData,
                topics,
                syllabusLabel: label,
                syllabusType: type,
              })
            }
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <PatternSelector
            grade={paperData.grade}
            subject={paperData.subject}
            syllabusType={paperData.syllabusType}
            selectedTopics={paperData.topics}
            onSelect={(pattern) =>
              setPaperData({ ...paperData, selectedPattern: pattern })
            }
            onNext={() => setStep(5)}
          />
        )}

        {step === 5 && (
          <div className="animate-fade-in-up">
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-sm mb-8">
              <h4 className="font-bold text-main mb-4 text-center text-xl">
                Final Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-main mb-2">
                    Exam Title{" "}
                    <span className="text-muted font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={paperData.examLabel}
                    onChange={(e) =>
                      setPaperData({ ...paperData, examLabel: e.target.value })
                    }
                    placeholder="e.g. Weekly Test #1"
                    className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-main mb-2">
                    Exam Date
                  </label>
                  {/* ✅ Applied tm-date-input class */}
                  <input
                    type="date"
                    value={paperData.examDate}
                    onChange={(e) =>
                      setPaperData({ ...paperData, examDate: e.target.value })
                    }
                    className="tm-date-input w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1"
                  />
                </div>
              </div>
            </div>
            <ModeSelector onSelect={handleModeSelect} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePaper;
