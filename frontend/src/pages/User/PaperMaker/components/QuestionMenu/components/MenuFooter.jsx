import React from "react";
import { FaCheck, FaRobot } from "react-icons/fa";

const MenuFooter = ({
  count,
  limit,
  onAdd,
  onAutoSelect,
  isChanged,
  activeTab,
}) => {
  return (
    <div className="h-16 shrink-0 border-y border-border flex items-center justify-between px-6 bg-card relative z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onAutoSelect}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg font-bold text-[0.95rem] cursor-pointer flex items-center gap-2 transition-all shadow-sm"
        >
          <FaRobot /> RANDOM SELECT
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <span className="text-[0.7rem] uppercase font-bold text-muted tracking-wider block leading-none mb-1">
            Total Selected
          </span>
          <span className="text-[1.1rem] font-extrabold text-main leading-none">
            {count} <span className="text-[0.8rem] text-muted">/ {limit}</span>
          </span>
        </div>
        <button
          onClick={onAdd}
          disabled={count === 0 && !isChanged}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-none px-8 py-2.5 rounded-lg font-bold text-[0.95rem] cursor-pointer flex items-center gap-2 shadow-sm transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          ADD QUESTIONS <FaCheck />
        </button>
      </div>
    </div>
  );
};

export default React.memo(MenuFooter);
