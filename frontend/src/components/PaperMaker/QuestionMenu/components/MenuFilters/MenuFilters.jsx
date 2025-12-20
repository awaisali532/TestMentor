import React from "react";
import "./MenuFilters.css";

const MenuFilters = ({ filters, setFilters }) => {
  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handleDifficultyChange = (e) => {
    setFilters({ ...filters, difficulty: e.target.value });
  };

  return (
    <div className="qm-filters">
      {/* Category Select */}
      <div className="qm-select-group">
        <label>Category</label>
        <select
          value={filters.category}
          onChange={handleCategoryChange}
          className="qm-select"
        >
          <option value="ALL">All Categories</option>
          <option value="TEXT">Text Book</option>
          <option value="EXERCISE">Exercise</option>
          <option value="PAST_PAPER">Past Papers</option>
          <option value="CONCEPTUAL">Conceptual</option>
        </select>
      </div>

      {/* Difficulty Select */}
      <div className="qm-select-group">
        <label>Difficulty</label>
        <select
          value={filters.difficulty}
          onChange={handleDifficultyChange}
          className="qm-select"
        >
          <option value="ALL">Mix (All)</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>
    </div>
  );
};

export default MenuFilters; // ✅ Ye line zaroori hai error hatane k liye
