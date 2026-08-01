import React, { useState, useEffect } from "react";
import { FaRobot, FaBolt } from "react-icons/fa";

const AutoLoadingScreen = ({ status }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-accent-1/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-accent-2/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated AI icon */}
      <div className="relative mx-auto mb-5 w-20 h-20 rounded-full bg-linear-to-tr from-accent-1 to-accent-2 p-[2px] shadow-lg shadow-accent-1/25">
        <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-accent-1 text-3xl">
          <FaRobot className="animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-main mb-1 tracking-tight">
        Generating Paper...
      </h2>
      <p className="text-sm text-muted mb-6">{status}</p>

      {/* Spinner dots */}
      <div className="flex justify-center gap-2 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-accent-1 animate-bounce [animation-delay:0ms]" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent-1 animate-bounce [animation-delay:150ms]" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent-1 animate-bounce [animation-delay:300ms]" />
      </div>

      {/* Elapsed Timer */}
      <div className="inline-flex items-center gap-2 bg-pill-bg border border-border rounded-full px-4 py-1.5 text-sm font-bold text-muted">
        <FaBolt className="text-accent-1 text-xs" />
        {elapsed}s elapsed
      </div>
    </div>
  );
};

export default React.memo(AutoLoadingScreen);
