import React, { useState } from "react";
import { FaHandPointer, FaRobot, FaTachometerAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const ModeSelector = ({ onSelect }) => {
  const [activeMode, setActiveMode] = useState(null);
  const [autoConfig, setAutoConfig] = useState({
    difficulties: ["EASY", "MEDIUM", "HARD"],
  });

  const toggleDifficulty = (diff) => {
    setAutoConfig((prev) => {
      const updated = prev.difficulties.includes(diff)
        ? prev.difficulties.filter((d) => d !== diff)
        : [...prev.difficulties, diff];
      return { ...prev, difficulties: updated };
    });
  };

  const handleGenerate = () => {
    if (activeMode === "AUTO" && autoConfig.difficulties.length === 0)
      return toast.error("Select at least one difficulty level");
    onSelect(activeMode, activeMode === "AUTO" ? autoConfig : null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up pb-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-main mb-2">
          Select Generation Method
        </h2>
        <p className="text-muted">Choose how you want to pick the questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Manual */}
        <div
          onClick={() => setActiveMode("MANUAL")}
          className={`bg-card border-2 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${activeMode === "MANUAL" ? "border-accent-1 bg-accent-1/5 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]" : "border-border hover:border-accent-1/50"}`}
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-3xl mx-auto mb-4">
            <FaHandPointer />
          </div>
          <h4 className="text-xl font-bold text-main mb-2">Manual Selection</h4>
          <p className="text-sm text-muted">
            Pick questions one-by-one. Full control.
          </p>
        </div>

        {/* Auto */}
        <div
          onClick={() => setActiveMode("AUTO")}
          className={`bg-card border-2 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${activeMode === "AUTO" ? "border-accent-1 bg-accent-1/5 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]" : "border-border hover:border-accent-1/50"}`}
        >
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-3xl mx-auto mb-4">
            <FaRobot />
          </div>
          <h4 className="text-xl font-bold text-main mb-2">Auto Generator</h4>
          <p className="text-sm text-muted">
            Let AI select questions instantly.
          </p>
        </div>
      </div>

      {activeMode === "AUTO" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-fade-in">
          <h5 className="font-bold text-main flex items-center gap-2 mb-4">
            <FaTachometerAlt className="text-accent-1" /> Select Difficulty Mix
          </h5>
          <div className="flex flex-wrap gap-3 mb-6">
            {["EASY", "MEDIUM", "HARD"].map((diff) => {
              const isChecked = autoConfig.difficulties.includes(diff);
              const colors =
                diff === "EASY"
                  ? "text-green-500 border-green-500 bg-green-500/10"
                  : diff === "MEDIUM"
                    ? "text-yellow-500 border-yellow-500 bg-yellow-500/10"
                    : "text-red-500 border-red-500 bg-red-500/10";
              return (
                <div
                  key={diff}
                  onClick={() => toggleDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all ${isChecked ? colors : "border-border text-muted bg-bg-body hover:border-accent-1/50"}`}
                >
                  {diff}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeMode && (
        <div className="text-center mt-8">
          <button
            onClick={handleGenerate}
            className="bg-linear-to-br from-accent-1 to-accent-2 text-white font-bold px-10 py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg shadow-accent-1/30 transition-all duration-300 cursor-pointer text-lg"
          >
            Generate Paper Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
