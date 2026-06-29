import React, { useRef, useEffect } from "react";
import { FaHome, FaChevronRight, FaTimes } from "react-icons/fa";

const WizardBreadcrumb = ({ step, setStep, paperData, onExit }) => {
  const scrollRef = useRef(null);

  // ✅ FIX: Automatically scroll to the exact active step and center it
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(".active-step");
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center", // Brings active step exactly in the middle of mobile screen
        });
      }
    }
  }, [step]);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-2 md:px-8 shadow-sm shrink-0 z-10 w-full relative">
      {/* Hide Scrollbar CSS */}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* ✅ Breadcrumbs Path (Scrollable & Responsive) */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 font-medium overflow-x-auto flex-nowrap hide-scrollbar text-sm flex-1 px-2 whitespace-nowrap scroll-smooth max-w-full"
      >
        {/* Home / Exit Icon */}
        <button
          onClick={onExit}
          className="text-muted hover:text-accent-1 hover:bg-pill-bg p-2 rounded-lg transition-all cursor-pointer shrink-0"
        >
          <FaHome size={16} />
        </button>

        {/* Step 1: Grade */}
        <FaChevronRight className="text-border shrink-0 text-[10px]" />
        <button
          onClick={() => setStep(1)}
          className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${step === 1 ? "active-step bg-accent-1/10 text-accent-1 font-bold" : "text-muted hover:bg-pill-bg hover:text-main"}`}
        >
          {paperData.grade || "Select Class"}
        </button>

        {/* Step 2: Subject */}
        {step >= 2 && (
          <>
            <FaChevronRight className="text-border shrink-0 text-[10px]" />
            <button
              onClick={() => setStep(2)}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${step === 2 ? "active-step bg-accent-1/10 text-accent-1 font-bold" : "text-muted hover:bg-pill-bg hover:text-main"}`}
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
              className={`px-2.5 py-1.5 rounded-lg transition-all max-w-35 md:max-w-50 truncate cursor-pointer shrink-0 ${step === 3 ? "active-step bg-accent-1/10 text-accent-1 font-bold" : "text-muted hover:bg-pill-bg hover:text-main"}`}
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
              className={`px-2.5 py-1.5 rounded-lg transition-all max-w-35 md:max-w-50 truncate cursor-default shrink-0 ${step === 4 ? "active-step bg-accent-1/10 text-accent-1 font-bold" : "text-muted"}`}
            >
              {paperData.selectedPattern?.presetName || "Paper Pattern"}
            </button>
          </>
        )}
      </div>

      {/* Actions (Only Exit) */}
      <div className="flex items-center shrink-0 border-l border-border pl-3 md:pl-4 bg-card z-20">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all font-semibold text-xs md:text-sm cursor-pointer"
        >
          <FaTimes /> <span className="hidden md:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};

export default WizardBreadcrumb;
