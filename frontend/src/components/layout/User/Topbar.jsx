import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaMoon, FaSun, FaUserShield } from "react-icons/fa";
import axios from "axios";

import { useTheme } from "../../../context/ThemeContext";
import { useUser } from "../../../context/UserContext";

// Child Components
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

const Topbar = ({ onMenuClick }) => {
  const { user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
        {/* Prominent Admin Switch Link (Only shown if user is admin or isSuperAdmin) */}
        {user && (user.isSuperAdmin || user.role === "admin") && (
          <button
            onClick={async () => {
              const token = localStorage.getItem("token");
              const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
              const prevCount = parseInt(localStorage.getItem("admin_test_mode_prev_count") || "0", 10);
              try {
                if (token) {
                  // 1. Delete all test papers
                  await axios.delete(`${BASE_URL}/api/papers/clear-test-papers`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  // 2. Reset usage count back to what it was before entering User Mode
                  await axios.post(
                    `${BASE_URL}/api/usage/reset-admin-test`,
                    { previousCount: prevCount },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                }
              } catch (e) {
                console.log("Cleanup test mode error", e);
              } finally {
                // 3. Clear local caches
                localStorage.removeItem("tm_dashboard_cache");
                localStorage.removeItem("admin_test_mode_prev_count");
                sessionStorage.clear();
                navigate("/admin/dashboard");
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-amber-500/10 text-red-500 border border-red-500/30 text-xs font-extrabold hover:bg-red-500 hover:text-white transition-all shadow-xs group cursor-pointer"
            title="Switch back to Admin Control Center and reset test mode data"
          >
            <FaUserShield size={13} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Return to Admin Panel</span>
          </button>
        )}

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
