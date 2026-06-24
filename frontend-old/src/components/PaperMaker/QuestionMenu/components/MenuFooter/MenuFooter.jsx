import React, { useState } from "react";
import {
  FaCheck,
  FaRobot,
  FaListUl,
  FaTimes,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import RenderText from "../../../../../components/common/RenderText"; // Path adjust kr lena
import "./MenuFooter.css";

const MenuFooter = ({
  count,
  limit,
  sectionLabel,
  onAdd,
  onAutoSelect,
  isChanged,
  selectedQuestions,
  onRemove,
  activeTab,
}) => {
  const [showList, setShowList] = useState(false);

  // Filter list to show only relevant selected questions (e.g. only MCQs if active tab is MCQ)
  // Agar aap chahte hain ke sare show hon to .filter hata dein
  const relevantSelected = selectedQuestions.filter(
    (q) => q.type === activeTab
  );

  return (
    <div className="qm-footer-wrapper">
      {/* ✅ SELECTED ITEMS DRAWER (Slides Up) */}
      {showList && (
        <div className="qm-selected-drawer">
          <div className="qm-drawer-header">
            <span>Selected Questions ({relevantSelected.length})</span>
            <button
              className="qm-close-drawer"
              onClick={() => setShowList(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="qm-drawer-list custom-scrollbar">
            {relevantSelected.length === 0 ? (
              <div className="qm-empty-msg">
                No questions selected in this section.
              </div>
            ) : (
              relevantSelected.map((q, i) => (
                <div key={q._id || i} className="qm-drawer-item">
                  <div className="qm-drawer-text">
                    <span className="qm-idx">{i + 1}.</span>
                    {/* Helper to strip HTML/Render text */}
                    <div className="qm-text-truncate">
                      <RenderText
                        text={q.statement?.en || q.statement?.ur || "Question"}
                      />
                    </div>
                  </div>
                  <button
                    className="qm-remove-btn"
                    onClick={() => onRemove(q)} // Clicking this removes question
                    title="Remove"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ✅ MAIN FOOTER BAR */}
      <div className="qm-footer">
        <div className="qm-footer-left">
          <div className="qm-counter-box">
            <span className="qm-count">
              {count} <span className="qm-limit">/ {limit}</span>
            </span>
            <span className="qm-label">{sectionLabel}</span>
          </div>

          {/* Toggle Button for List */}
          <button
            className={`qm-view-list-btn ${showList ? "active" : ""}`}
            onClick={() => setShowList(!showList)}
          >
            {showList ? <FaChevronDown /> : <FaChevronUp />}
            <span className="ms-2">View Selected</span>
            <span className="qm-badge-mini">{relevantSelected.length}</span>
          </button>
        </div>

        <div className="qm-footer-actions">
          <button
            className="qm-btn-auto"
            onClick={onAutoSelect}
            title="Auto Fill"
          >
            <FaRobot /> <span className="btn-text">Auto</span>
          </button>

          <button
            className={`qm-btn-add ${isChanged ? "pulse" : ""}`}
            onClick={onAdd}
            disabled={count === 0 && !isChanged}
          >
            <FaCheck />
            <span className="btn-text">
              {isChanged ? "Update Paper" : "Add to Paper"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuFooter;
