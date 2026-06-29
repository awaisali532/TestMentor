import React from "react";
import { FaHome, FaChevronRight, FaTimes } from "react-icons/fa";

const WizardBreadcrumb = ({ step, setStep, paperData, onExit }) => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0 z-10 w-full overflow-hidden">
      {/* Breadcrumbs Path (Scrollable on Mobile) */}
      <div className="flex items-center gap-2 font-medium overflow-x-auto custom-scrollbar text-sm md:text-base flex-1 pr-4 whitespace-nowrap">
        {/* Home / Exit Icon */}
        <button
          onClick={onExit}
          title="Exit Wizard"
          className="text-muted hover:text-accent-1 hover:bg-pill-bg p-2 rounded-lg transition-all cursor-pointer shrink-0"
        >
          <FaHome size={18} />
        </button>

        {/* Step 1: Grade */}
        <FaChevronRight className="text-border shrink-0 text-[10px]" />
        <button
          onClick={() => setStep(1)}
          className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${step === 1 ? "bg-accent-1/10 text-accent-1 font-bold" : "text-muted hover:bg-pill-bg hover:text-main"}`}
        >
          {paperData.grade || "Select Class"}
        </button>

        {/* Step 2: Subject */}
        {step >= 2 && (
          <>
            <FaChevronRight className="text-border shrink-0 text-[10px]" />
            <button
              onClick={() => setStep(2)}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${step === 2 ? "bg-accent-1/10 text-accent-1 font-bold" : "text-muted hover:bg-pill-bg hover:text-main"}`}
            >
              {paperData.subject || "Select Subject"}
            </button>
          </>
        )}

        {/* Step 3: Syllabus */}
        {step >= 3 && (
          <>
            <FaChevronRight className="text-border shrink-0 text-[10px]" />
            <button
              onClick={() => setStep(3)}
              title={paperData.syllabusLabel || "Select Syllabus"}
              className={`px-2.5 py-1.5 rounded-lg transition-all max-w-3.75 md:max-w-50 truncate cursor-pointer shrink-0 ${step === 3 ? "bg-accent-1/10 text-accent-1 font-bold" : "text-muted hover:bg-pill-bg hover:text-main"}`}
            >
              {paperData.syllabusLabel || "Select Syllabus"}
            </button>
          </>
        )}

        {/* Step 4: Pattern */}
        {step >= 4 && (
          <>
            <FaChevronRight className="text-border shrink-0 text-[10px]" />
            <button
              className={`px-2.5 py-1.5 rounded-lg transition-all max-w-3.75 md:max-w-50 truncate cursor-default shrink-0 ${step === 4 ? "bg-accent-1/10 text-accent-1 font-bold" : "text-muted"}`}
            >
              {paperData.selectedPattern?.presetName || "Paper Pattern"}
            </button>
          </>
        )}
      </div>

      {/* Actions (Only Exit) */}
      <div className="flex items-center shrink-0 border-l border-border pl-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-border text-muted hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all font-semibold text-sm cursor-pointer"
        >
          <FaTimes /> <span className="hidden md:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};

export default WizardBreadcrumb;
