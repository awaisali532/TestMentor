import React from "react";
import { useLocation } from "react-router-dom";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";

// Import your custom hooks context if you have one, else standard approach
// Assuming standard theme handling is available, if not just skip theme logic or use what's provided
import { useTheme } from "../../../context/ThemeContext";

// Child Components
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

const Topbar = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme(); // Adjust if context names differ
  const location = useLocation();

  // Dynamic Title based on URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("past-papers")) return "Past Papers";
    if (path.includes("practice")) return "Study Mode";
    if (path.includes("settings")) return "Settings";
    return "TestMentor";
  };

  return (
    <header className="h-20 ml-6 px-4 md:px-8 bg-card border-b border-border flex items-center justify-between shrink-0 transition-colors duration-300 z-30">
      {/* LEFT SIDE: Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger (Only visible on Mobile/Tablet) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted hover:text-main focus:outline-none cursor-pointer"
        >
          <FaBars size={22} />
        </button>

        {/* Dynamic Page Title */}
        <div className="hidden sm:block">
          <h2 className="text-xl font-extrabold text-main capitalize tracking-wide">
            {getPageTitle()}
          </h2>
          <p className="text-xs text-muted font-medium mt-0.5">
            Welcome back to TestMentor
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-muted hover:text-accent-1 hover:bg-pill-bg transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="w-px h-8 bg-border hidden sm:block mx-2"></div>

        {/* User Profile Menu */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Topbar;
