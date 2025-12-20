import React, { useState, useEffect } from "react";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters"; // Next Step
import TypeTabs from "./components/TypeTabs/TypeTabs"; // Next Step
import QuestionList from "./components/QuestionList/QuestionList"; // Next Step
import "./QuestionMenu.css";

const QuestionMenu = ({ isOpen, onClose, paperData }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("MCQ"); // MCQ, SHORT, LONG
  const [filters, setFilters] = useState({
    category: "ALL", // EXERCISE, PAST_PAPER, etc.
    difficulty: "ALL", // EASY, MEDIUM, HARD
  });

  // Animation handling
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) setShow(true);
    else setTimeout(() => setShow(false), 300); // Wait for animation
  }, [isOpen]);

  if (!show && !isOpen) return null;

  return (
    <div className={`qm-overlay ${isOpen ? "open" : ""}`}>
      <div className="qm-container">
        {/* 1. HEADER (Info + Theme Toggle + Close) */}
        <MenuHeader paperData={paperData} onClose={onClose} />

        <div className="qm-body">
          {/* 2. FILTERS & TABS (Sticky Top) */}
          <div className="qm-controls">
            {/* Hum inko next step mein banayenge, abhi placeholder rakh lo */}
            <div className="placeholder-controls">
              <MenuFilters filters={filters} setFilters={setFilters} />
              <TypeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              <p
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--u-text-muted)",
                }}
              >
                Filters & Tabs coming soon...
              </p>
            </div>
          </div>

          {/* 3. QUESTIONS LIST (Scrollable) */}
          <div className="qm-content">
            {/* <QuestionList ... /> */}
            <p
              style={{
                padding: "50px",
                textAlign: "center",
                color: "var(--u-text-muted)",
              }}
            >
              Questions will load here...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionMenu;
