import React from "react";
import "./TypeTabs.css";

const TypeTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "MCQ", label: "Multiple Choice" },
    { id: "SHORT", label: "Short Questions" },
    { id: "LONG", label: "Long Questions" },
  ];

  return (
    <div className="qm-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`qm-tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
          {/* Badge Placeholder (Future mein dynamic hoga) */}
          <span className="qm-tab-badge">0/10</span>
        </button>
      ))}
    </div>
  );
};

export default TypeTabs;
