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
import { useTheme } from "../../../../../context/ThemeContext";
import "./MenuHeader.css";

const MenuHeader = ({ paperData, onClose, onEditPreset }) => {
  const { theme, toggleTheme } = useTheme();

  // Extract Pattern Info
  const selectedPattern = paperData?.selectedPattern;
  const isSystem = selectedPattern?.isSystemPreset; // Check if it's a System Preset

  return (
    <div className="qm-header">
      {/* LEFT: Paper Info */}
      <div className="qm-header-info">
        {/* Badges Row */}
        <div className="qm-badge-group">
          <span className="qm-badge grade">{paperData?.grade || "Class"}</span>
          <span className="qm-badge subject">
            {paperData?.subject || "Subject"}
          </span>

          {/* ✅ SHOW SYSTEM / CUSTOM BADGE */}
          <span className={`qm-badge type ${isSystem ? "system" : "custom"}`}>
            {isSystem ? <FaLock size={10} /> : <FaUserEdit size={11} />}
            {isSystem ? "System Preset" : "Custom Preset"}
          </span>
        </div>

        {/* Title Row */}
        <div className="qm-title-row">
          <h3 className="qm-syllabus-title">
            <FaLayerGroup className="me-2 text-accent" />
            {paperData?.syllabusLabel || "Selected Syllabus"}
          </h3>

          {/* ✅ SHOW PRESET NAME */}
          {selectedPattern?.presetName && (
            <span className="qm-preset-name">
              — {selectedPattern.presetName}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="qm-header-actions">
        {/* ✅ CONDITIONAL EDIT BUTTON: Only show if NOT System Preset */}
        {!isSystem && (
          <button
            className="qm-btn outline"
            onClick={onEditPreset}
            title="Edit Custom Pattern"
          >
            <FaEdit /> <span>Edit Pattern</span>
          </button>
        )}

        <div className="qm-divider-v"></div>

        {/* Theme Toggle */}
        <button
          className="qm-icon-btn"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <FaSun className="icon-sun" />
          ) : (
            <FaMoon className="icon-moon" />
          )}
        </button>

        {/* Close Button */}
        <button
          className="qm-icon-btn close"
          onClick={onClose}
          title="Close Menu"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default MenuHeader;
