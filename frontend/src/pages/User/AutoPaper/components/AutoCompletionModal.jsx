import React from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaRedo,
  FaInfoCircle,
} from "react-icons/fa";

const AutoCompletionModal = ({ counts, onProceed, onRetry, error, quality }) => {
  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full max-w-md bg-card border border-red-500/30 rounded-2xl p-6 shadow-xl text-center animate-fade-in-up">
        <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
          <FaExclamationTriangle />
        </div>
        <h3 className="text-xl font-bold text-main mb-2">Generation Failed</h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">{error}</p>
        <button
          onClick={onRetry}
          className="w-full bg-accent-1 hover:bg-accent-1/90 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <FaRedo /> Try Again
        </button>
      </div>
    );
  }

  // ── Quality below threshold — show warning but allow proceed ─────────────────
  const qualityPassed  = quality?.passed !== false; // treat null as passed
  const qualityScore   = quality?.score ?? 100;
  const qualityIssues  = quality?.issues || [];

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl text-center animate-fade-in-up">
      {/* Icon */}
      <div
        className={`w-14 h-14 ${qualityPassed ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"} rounded-full flex items-center justify-center text-2xl mx-auto mb-3`}
      >
        {qualityPassed ? <FaCheckCircle /> : <FaExclamationTriangle />}
      </div>

      <h3 className="text-xl font-extrabold text-main mb-1">
        {qualityPassed ? "Paper Generated!" : "Paper Generated with Warnings"}
      </h3>
      <p className="text-xs text-muted mb-4">
        {qualityPassed
          ? "Questions selected using constraint-based weighted engine."
          : "Paper was generated but some quality constraints could not be fully satisfied."}
      </p>

      {/* Quality warning block */}
      {!qualityPassed && qualityIssues.length > 0 && (
        <div className="bg-yellow-500/8 border border-yellow-500/25 rounded-xl px-4 py-3 mb-4 text-left space-y-1">
          <p className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 mb-1.5">
            <FaInfoCircle /> Quality Score: {qualityScore}/100
          </p>
          {qualityIssues.map((issue, i) => (
            <p key={i} className="text-[11px] text-yellow-700 dark:text-yellow-300 leading-relaxed">
              • {issue}
            </p>
          ))}
        </div>
      )}

      {/* Question count summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-pill-bg border border-border/50 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-accent-1">{counts.mcq || 0}</span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">MCQs</span>
        </div>
        <div className="bg-pill-bg border border-border/50 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-accent-1">{counts.short || 0}</span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Short</span>
        </div>
        <div className="bg-pill-bg border border-border/50 rounded-xl p-3 text-center">
          <span className="block text-2xl font-black text-accent-1">{counts.long || 0}</span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Long</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onProceed}
          className="w-full bg-linear-to-r from-accent-1 to-accent-2 hover:opacity-95 text-white font-extrabold py-3 px-6 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-sm"
        >
          Open in Paper Workspace <FaArrowRight />
        </button>
        {!qualityPassed && (
          <button
            onClick={onRetry}
            className="w-full bg-pill-bg border border-border text-muted hover:text-main font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <FaRedo /> Regenerate (Different Seed)
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(AutoCompletionModal);
