import React from "react";
import { FaSun, FaMoon, FaBuilding } from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";
import { useUser } from "../../../../context/UserContext"; // ✅ Real Data ke liye

const MakerTopbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser(); // ✅ User Context fetch kiya

  // Safe data extraction (Fallback ke sath)
  const instituteName =
    user?.institute?.name ||
    user?.instituteName ||
    user?.name ||
    "Institute Name";
  const instituteAddress =
    user?.institute?.address || user?.instituteAddress || "";

  return (
    <div className="h-16 bg-card border-b border-border flex justify-between items-center px-6 shrink-0 z-50">
      {/* LEFT: Website Name & Version */}
      <div className="flex flex-col">
        <h1 className="text-xl font-extrabold text-accent-1 leading-tight tracking-tight uppercase">
          TestMentor
        </h1>
        <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">
          Version 1.00
        </span>
      </div>

      {/* RIGHT: Real Institute Details & Theme */}
      <div className="flex items-center gap-6">
        <div className="flex-col items-end text-right hidden sm:flex">
          <h2 className="text-sm font-bold text-main leading-tight flex items-center gap-2 uppercase">
            <FaBuilding className="text-accent-1" /> {instituteName}
          </h2>
          {instituteAddress && (
            <span className="text-[0.7rem] text-muted font-medium">
              {instituteAddress}
            </span>
          )}
        </div>

        <div className="w-px h-8 bg-border hidden sm:block"></div>

        <button
          onClick={toggleTheme}
          className="size-10 rounded-full flex items-center justify-center bg-bg-body border border-border text-main hover:text-accent-1 hover:border-accent-1 transition-all cursor-pointer shadow-sm hover:shadow-md"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <FaSun className="text-amber-500 text-lg" />
          ) : (
            <FaMoon className="text-indigo-500 text-lg" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MakerTopbar;
