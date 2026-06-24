import React from "react";
import { Link } from "react-router-dom";
import { FaLock, FaArrowRight } from "react-icons/fa";

// Props ke through data ayega
const DashboardActionCard = ({
  title,
  description,
  icon,
  tag,
  glowClass, // 'blue-glow' or 'purple-glow'
  btnClass, // 'btn-blue' or 'btn-purple'
  link,
  isLocked,
  buttonText,
}) => {
  return (
    <div className={`ud-card action-card ${isLocked ? "locked" : ""}`}>
      {/* Top Section */}
      <div className="card-top">
        <div className={`card-icon-bg ${glowClass}`}>
          {/* Agar locked hai to Lock icon, warna passed icon */}
          {isLocked ? <FaLock /> : icon}
        </div>
        <span className="card-tag">{tag}</span>
      </div>

      {/* Info Section */}
      <div className="card-info">
        <h5>{title}</h5>
        <p>{description}</p>
      </div>

      {/* Button Section */}
      {isLocked ? (
        <button className="ud-btn btn-locked" disabled>
          Limit Reached (Upgrade)
        </button>
      ) : (
        <Link to={link} className={`ud-btn ${btnClass}`}>
          {buttonText} <FaArrowRight className="ml-2 inline" size={12} />
        </Link>
      )}
    </div>
  );
};

export default DashboardActionCard;
