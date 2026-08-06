import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBars,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaUserCog,
  FaCogs,
  FaCrown,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../context/ThemeContext";

// Avatars (Matching User ProfileDropdown)
import BoyAvatar from "../../../assets/images/Avatar/boy.jpg";
import GirlAvatar from "../../../assets/images/Avatar/girl.svg";

const AdminTopbar = ({ onMenuClick }) => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Avatar Image Provider (Exact same logic as User side)
  const getAvatarSource = () => {
    if (user?.image) return user.image;
    if (user?.avatar) return user.avatar;
    const gender = user?.gender?.toLowerCase() || "";
    if (gender === "female") return GirlAvatar;
    if (gender === "male") return BoyAvatar;
    return BoyAvatar;
  };

  const avatarSrc = getAvatarSource();

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      {/* LEFT: Mobile Menu Button & Control Tag */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted hover:text-main p-2 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
          title="Open Menu"
        >
          <FaBars size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-extrabold uppercase tracking-wider border border-red-500/20 shadow-2xs">
            Admin Control Center
          </span>
        </div>
      </div>

      {/* RIGHT: Actions, Mode Switcher & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* PROMINENT SWITCH TO USER MODE BUTTON (Directly on Topbar) */}
        <button
          onClick={async () => {
            try {
              // Save current usage count before entering test mode, so we can restore it when returning
              const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
              const token = localStorage.getItem("token");
              if (token) {
                const statsRes = await axios.get(`${BASE_URL}/api/usage/stats`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (statsRes.data.success) {
                  localStorage.setItem("admin_test_mode_prev_count", statsRes.data.usage);
                }
              }
            } catch (e) {
              // If stats fetch fails, store 0 as fallback
              localStorage.setItem("admin_test_mode_prev_count", "0");
            } finally {
              navigate("/user/dashboard");
            }
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all shadow-xs group cursor-pointer"
          title="Switch to User Workspace for testing"
        >
          <FaExternalLinkAlt size={11} className="group-hover:rotate-12 transition-transform" />
          <span>Switch to User Mode</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="size-9 rounded-xl bg-pill-bg border border-border flex items-center justify-center text-main hover:bg-card hover:border-accent-1/50 transition-all cursor-pointer shadow-2xs"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <FaSun className="text-amber-500" size={16} />
          ) : (
            <FaMoon className="text-purple-500" size={16} />
          )}
        </button>

        {/* PROFILE PICTURE AVATAR BUTTON (ONLY CIRCULAR PICTURE, EXACT SAME AS USER SIDE) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center focus:outline-none cursor-pointer transition-transform hover:scale-105"
            title="Profile Options"
          >
            <div className="rounded-full p-0.5 bg-linear-to-tr from-red-500 via-amber-500 to-yellow-500 shadow-md">
              <div className="bg-card rounded-full p-0.5">
                <img
                  src={avatarSrc}
                  alt={user?.name || "Admin"}
                  className="w-9 h-9 rounded-full object-cover"
                />
              </div>
            </div>
          </button>

          {/* DROPDOWN POPUP MENU */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
              {/* Header inside dropdown */}
              <div className="p-4 border-b border-border bg-pill-bg/50 flex items-center gap-3">
                <div className="size-11 rounded-full border border-border overflow-hidden shrink-0 bg-pill-bg">
                  <img
                    src={avatarSrc}
                    alt={user?.name || "Admin"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-sm font-bold text-main truncate leading-tight">
                    {user?.name || "Admin User"}
                  </h4>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full w-max mt-1 border border-amber-500/20">
                    <FaCrown size={9} />
                    {user?.isSuperAdmin ? "SUPER ADMIN" : "ADMINISTRATOR"}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="p-2 space-y-1">
                <Link
                  to="/admin/profile-settings"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-main hover:bg-pill-bg hover:text-accent-1 transition-colors"
                >
                  <FaUserCog size={14} className="text-accent-1" />
                  <span>Profile & Personal Info</span>
                </Link>

                {user?.isSuperAdmin && (
                  <Link
                    to="/admin/site-settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-main hover:bg-pill-bg hover:text-accent-1 transition-colors"
                  >
                    <FaCogs size={14} className="text-amber-500" />
                    <span>Site Settings</span>
                  </Link>
                )}
              </div>

              {/* Footer / Logout */}
              <div className="p-2 border-t border-border bg-pill-bg/30">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  <FaSignOutAlt size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
