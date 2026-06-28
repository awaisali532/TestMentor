import React from "react";
import { Link } from "react-router-dom";
import { FaLock, FaArrowRight } from "react-icons/fa";

const DashboardActionCard = ({
  title,
  description,
  icon,
  tag,
  colorTheme = "blue", // 'blue', 'purple', 'yellow' etc.
  link,
  isLocked,
  buttonText,
}) => {
  // Theme Maps for Tailwind
  const themeStyles = {
    blue: {
      glow: "bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      btn: "bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
    },
    purple: {
      glow: "bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      btn: "bg-linear-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
    },
    yellow: {
      glow: "bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      btn: "bg-linear-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50",
    },
  };

  const currentTheme = themeStyles[colorTheme] || themeStyles.blue;

  return (
    <div
      className={`bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-55 transition-all duration-300 relative overflow-hidden group ${
        isLocked
          ? "opacity-90 bg-[repeating-linear-gradient(45deg,var(--color-card),var(--color-card)_10px,var(--color-pill-bg)_10px,var(--color-pill-bg)_20px)]"
          : "hover:-translate-y-2 hover:border-accent-1/50 hover:shadow-xl hover:shadow-accent-1/5"
      }`}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${currentTheme.glow}`}
        >
          {isLocked ? <FaLock /> : icon}
        </div>
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider bg-pill-bg px-2.5 py-1 rounded-md">
          {tag}
        </span>
      </div>

      {/* Info Section */}
      <div className="mb-4">
        <h5 className="text-xl font-bold text-main mb-1">{title}</h5>
        <p className="text-sm text-muted line-clamp-2">{description}</p>
      </div>

      {/* Button Section */}
      {isLocked ? (
        <button className="w-full text-center p-3 rounded-xl font-bold text-muted bg-pill-bg border border-dashed border-border cursor-not-allowed text-sm">
          Limit Reached (Upgrade)
        </button>
      ) : (
        <Link
          to={link}
          className={`w-full text-center p-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${currentTheme.btn}`}
        >
          {buttonText} <FaArrowRight size={12} />
        </Link>
      )}
    </div>
  );
};

export default DashboardActionCard;
