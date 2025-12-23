import React from "react";
import { FaPlus, FaRandom, FaCheck, FaSync } from "react-icons/fa";
import "./MenuFooter.css";

const MenuFooter = ({
  count,
  limit,
  onAdd,
  onAutoSelect,
  sectionLabel,
  isChanged = false, // ✅ NEW PROP: Pata chalega ke user ne changing ki hai ya nahi
}) => {
  const isComplete = limit > 0 && count === limit;
  const isOvershot = count > limit;

  // ✅ LOGIC UPDATE:
  // Button tabhi active hoga jab:
  // 1. Limit poori ho (isComplete)
  // 2. AUR User ne koi tabdeeli ki ho (isChanged)
  const isDisabled = !isComplete || (isComplete && !isChanged);

  // Helper to determine button Text & Icon
  const getButtonContent = () => {
    if (isComplete) {
      if (isChanged) {
        return { text: "Update Paper", icon: <FaSync /> }; // Change hui hai
      }
      return { text: "Saved (No Changes)", icon: <FaCheck /> }; // Change nahi hui
    }
    if (count === 0) {
      return { text: "Select Questions", icon: <FaPlus /> };
    }
    return { text: `Select ${limit - count} more`, icon: <FaPlus /> };
  };

  const { text, icon } = getButtonContent();

  return (
    <div className="qm-footer">
      {/* Left: Auto Pick & Status */}
      <div className="qm-footer-left">
        <button
          className="qm-footer-btn outline"
          onClick={onAutoSelect}
          title="Auto Pick Remaining"
        >
          <FaRandom /> <span className="hide-mobile">Auto Pick</span>
        </button>

        <div className="qm-selection-info">
          {/* Progress Pill */}
          <div
            className={`progress-pill ${
              isComplete ? "success" : isOvershot ? "error" : ""
            }`}
          >
            <span className="curr">{count}</span>
            <span className="sep">/</span>
            <span className="total">{limit > 0 ? limit : "-"}</span>
          </div>

          <span className="count-text">
            Selected for <strong>{sectionLabel}</strong>
          </span>
        </div>
      </div>

      {/* Right: Add Action */}
      <div className="qm-footer-right">
        <button
          // Agar complete hai aur change hai, to Primary color, warna Disabled look
          className={`qm-footer-btn ${
            isComplete && isChanged ? "primary" : "disabled"
          }`}
          disabled={isDisabled}
          onClick={onAdd}
        >
          {icon} {text}
        </button>
      </div>
    </div>
  );
};

export default MenuFooter;
