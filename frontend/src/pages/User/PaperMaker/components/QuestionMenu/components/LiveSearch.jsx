import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const LiveSearch = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 relative z-50">
      <label className="text-[0.75rem] font-bold text-muted uppercase tracking-wider">
        Search Questions
      </label>
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="e.g. what is physics..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-bg-body text-main text-[0.9rem] focus:outline-none focus:border-accent-1 transition-all"
        />
        {/* Cross Button to clear search quickly */}
        {value && (
          <FaTimes
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted cursor-pointer hover:text-red-500 transition-colors"
            onClick={() => onChange("")}
            title="Clear Search"
          />
        )}
      </div>
    </div>
  );
};

export default LiveSearch;
