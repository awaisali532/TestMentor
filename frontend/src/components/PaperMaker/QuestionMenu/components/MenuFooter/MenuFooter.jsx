import React from "react";
import { FaPlus, FaRandom, FaCheck } from "react-icons/fa";
import "./MenuFooter.css";

const MenuFooter = ({
  count, // Abhi kitne select kiye hain
  limit, // Total kitne chahiye (Target)
  onAdd,
  onAutoSelect,
  sectionLabel,
}) => {
  // Logic: Kya Add karna allow hai?
  // Add tabhi hoga jab Count > 0 aur Count == Limit (Exact match)
  // Note: Long Questions mein parts ki waja se logic thori flexible ho sakti hai,
  // lekin filhal hum strict check laga rahe hain taake user ghalti na kare.

  const isComplete = limit > 0 && count === limit;
  const isOvershot = count > limit; // Safety check
  const isDisabled = !isComplete;

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
          {/* Progress Indicator */}
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
          className={`qm-footer-btn ${isComplete ? "primary" : "disabled"}`}
          disabled={isDisabled}
          onClick={onAdd}
        >
          {isComplete ? <FaCheck /> : <FaPlus />}

          {isComplete
            ? "Add to Paper"
            : count === 0
            ? "Select Questions"
            : `Select ${limit - count} more`}
        </button>
      </div>
    </div>
  );
};

export default MenuFooter;
