import React from "react";

const ClassTabs = ({ classes, activeClass, onTabChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-3 mb-8">
      {classes.map((cls) => (
        <button
          key={cls}
          onClick={() => onTabChange(cls)}
          className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 border ${
            activeClass === cls
              ? "bg-linear-to-br from-accent-1 to-accent-2 text-white border-transparent shadow-lg shadow-accent-1/40"
              : "bg-pill-bg text-muted border-border hover:border-accent-1 hover:text-main"
          }`}
        >
          {cls}
        </button>
      ))}
    </div>
  );
};

export default ClassTabs;
