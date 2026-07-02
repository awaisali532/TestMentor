import React from "react";
import {
  FaTimes,
  FaSun,
  FaMoon,
  FaEdit,
  FaLayerGroup,
  FaLock,
  FaUserEdit,
} from "react-icons/fa";
import { useTheme } from "../../../../../../context/ThemeContext";

const MenuHeader = ({ paperData, onClose, onEditPreset }) => {
  const { theme, toggleTheme } = useTheme();
  const selectedPattern = paperData?.selectedPattern;
  const isSystem = selectedPattern?.isSystemPreset;

  return (
    <div className="h-20 bg-card border-b border-border flex justify-between items-center px-6 shrink-0">
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2 items-center">
          <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 bg-blue-500/10 text-blue-500 border border-blue-500/20">
            {paperData?.grade || "Class"}
          </span>
          <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {paperData?.subject || "Subject"}
          </span>
          <span
            className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 border ${isSystem ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
          >
            {isSystem ? <FaLock size={10} /> : <FaUserEdit size={11} />}{" "}
            {isSystem ? "System Preset" : "Custom Preset"}
          </span>
        </div>
        <div className="flex items-baseline gap-2.5">
          <h3 className="m-0 text-[1.1rem] font-bold text-main flex items-center">
            <FaLayerGroup className="mr-2 text-accent-1" />{" "}
            {paperData?.syllabusLabel || "Selected Syllabus"}
          </h3>
          {selectedPattern?.presetName && (
            <span className="text-[0.9rem] text-muted font-medium italic">
              — {selectedPattern.presetName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isSystem && (
          <button
            onClick={onEditPreset}
            title="Edit Custom Pattern"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-transparent text-muted text-[0.9rem] font-semibold cursor-pointer transition-all hover:border-accent-1 hover:text-accent-1 hover:bg-pill-bg"
          >
            <FaEdit /> <span className="hidden sm:inline">Edit Pattern</span>
          </button>
        )}
        <div className="w-px h-6.25 bg-border mx-1"></div>
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-bg-body border border-border text-main text-[1.1rem] cursor-pointer transition-all hover:bg-pill-bg hover:-translate-y-0.5 hover:shadow-md"
        >
          {theme === "dark" ? (
            <FaSun className="text-amber-500" />
          ) : (
            <FaMoon className="text-indigo-500" />
          )}
        </button>
        <button
          onClick={onClose}
          title="Close Menu"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-bg-body border border-border text-main text-[1.1rem] cursor-pointer transition-all hover:bg-red-500 hover:border-red-500 hover:text-white"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default React.memo(MenuHeader);
