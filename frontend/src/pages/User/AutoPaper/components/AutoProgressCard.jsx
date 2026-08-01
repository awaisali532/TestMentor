import React from "react";
import { FaRobot, FaCheckCircle, FaSpinner } from "react-icons/fa";

const AutoProgressCard = ({ progress, status, isComplete }) => {
  return (
    <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 shadow-xl text-center relative overflow-hidden transition-all duration-300">
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent-1/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-2/20 rounded-full blur-3xl pointer-events-none" />

      {/* AI Robot Animated Avatar */}
      <div className="relative mx-auto mb-6 w-20 h-20 rounded-full bg-linear-to-tr from-accent-1 to-accent-2 p-0.5 shadow-lg shadow-accent-1/20 animate-bounce-slow">
        <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-accent-1 text-3xl">
          {isComplete ? (
            <FaCheckCircle className="text-emerald-500 text-4xl animate-scale-in" />
          ) : (
            <FaRobot className="animate-pulse" />
          )}
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-main mb-1 tracking-tight">
        AI Paper Generator
      </h2>
      <p className="text-sm text-muted mb-6">
        {isComplete
          ? "Paper generation complete! Redirecting to workspace..."
          : "Analyzing question bank & applying difficulty mix..."}
      </p>

      {/* Progress Track & Bar */}
      <div className="w-full bg-pill-bg border border-border/60 rounded-full h-4 p-0.5 mb-4 relative overflow-hidden shadow-inner">
        <div
          className="h-full bg-linear-to-r from-emerald-500 via-accent-1 to-accent-2 rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${Math.max(progress, 5)}%` }}
        >
          {/* Animated Stripe Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem] animate-[stripes_1s_linear_infinite]" />
        </div>
      </div>

      {/* Percentage & Status Tag */}
      <div className="flex items-center justify-between px-1 text-xs font-bold">
        <span className="text-accent-1 bg-accent-1/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
          {!isComplete && <FaSpinner className="animate-spin text-[10px]" />}
          {status}
        </span>
        <span className="text-main text-sm font-extrabold">{progress}%</span>
      </div>
    </div>
  );
};

export default React.memo(AutoProgressCard);
