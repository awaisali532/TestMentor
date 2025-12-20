import React from "react";
import { FaTimes, FaSun, FaMoon, FaEdit, FaLayerGroup } from "react-icons/fa";
import { useTheme } from "../../../../../context/ThemeContext";
// Note: Path adjust kar lena agar folder structure different ho
import "./MenuHeader.css";

const MenuHeader = ({ paperData, onClose, onEditPreset }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="qm-header">
      {/* LEFT: Paper Info */}
      <div className="qm-header-info">
        <div className="qm-badge-group">
          <span className="qm-badge grade">{paperData?.grade || "Class"}</span>
          <span className="qm-badge subject">
            {paperData?.subject || "Subject"}
          </span>
        </div>
        <h3 className="qm-syllabus-title">
          <FaLayerGroup className="me-2" />
          {paperData?.syllabusLabel || "Selected Syllabus"}
        </h3>
      </div>

      {/* RIGHT: Actions */}
      <div className="qm-header-actions">
        {/* Edit Preset Button */}
        <button
          className="qm-btn outline"
          onClick={onEditPreset}
          title="Edit Preset"
        >
          <FaEdit /> <span>Edit Pattern</span>
        </button>

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
