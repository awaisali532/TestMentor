import React from "react";
import { FaPlus, FaRandom, FaList } from "react-icons/fa";
import "./MenuFooter.css";

const MenuFooter = ({ count, onAdd, onAutoSelect, sectionLabel }) => {
  return (
    <div className="qm-footer">
      {/* Left: Summary & Auto */}
      <div className="qm-footer-left">
        <button
          className="qm-footer-btn outline"
          onClick={onAutoSelect}
          title="Auto Pick"
        >
          <FaRandom /> <span className="hide-mobile">Auto Pick</span>
        </button>
        <div className="qm-selection-info">
          <span className="count-badge">{count}</span>
          <span className="count-text">
            Selected for <strong>{sectionLabel}</strong>
          </span>
        </div>
      </div>

      {/* Right: Add Button */}
      <div className="qm-footer-right">
        <button
          className="qm-footer-btn primary"
          disabled={count === 0}
          onClick={onAdd}
        >
          <FaPlus /> Add to Paper
        </button>
      </div>
    </div>
  );
};

export default MenuFooter;
