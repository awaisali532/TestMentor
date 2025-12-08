import React from "react";
import "./StatCard.css";

// Note: Changed prop 'bgColor' to 'colorType' (e.g., "blue", "green")
const StatCard = ({ title, value, icon, colorType }) => {
  return (
    <div
      className={`custom-card d-flex justify-content-between align-items-center p-4 rounded-4 shadow-sm text-white gradient-${colorType}`}
    >
      <div className="card-content">
        <h4 className="card-title fw-medium opacity-75 mb-2 text-uppercase">
          {title}
        </h4>
        <h2 className="card-value fw-bold">{value}</h2>
      </div>

      {/* Icon Wrapper centered using Bootstrap d-flex */}
      <div className="card-icon-wrapper d-flex align-items-center justify-content-center text-white">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
