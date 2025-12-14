import React from "react";
import "./StatCard.css";

const StatCard = ({ title, value, icon, colorType }) => {
  return (
    <div className={`stat-card-modern ${colorType}`}>
      <div className="stat-info">
        <h4 className="stat-title">{title}</h4>
        <h2 className="stat-value">{value}</h2>
      </div>

      <div className="stat-icon-box">{icon}</div>
    </div>
  );
};

export default StatCard;
