import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaFileAlt,
  FaUserCog,
  FaCrown,
  FaSignOutAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import "./UserSidebar.css";

const UserSidebar = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Safe Retrieve
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    planType: "free",
  };

  // Helper for active class
  const isActive = (path) => (location.pathname === path ? "usr-active" : "");

  const handleLogout = () => {
    localStorage.clear(); // Clear all user data
    navigate("/login");
  };

  return (
    <div className="usr-sidebar-container">
      {/* 1. BRAND */}
      <div className="usr-brand">
        <h3>
          Test<span style={{ color: "var(--u-accent)" }}>Mentor</span>
        </h3>
      </div>

      {/* 2. MINI PROFILE CARD */}
      <div className="usr-profile-card">
        <div className="usr-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="usr-info">
          <p className="usr-name">{user.name}</p>
          {user.planType === "paid" ? (
            <span className="usr-badge usr-badge-paid">
              <FaCrown size={10} /> Premium
            </span>
          ) : (
            <span className="usr-badge usr-badge-free">Free Plan</span>
          )}
        </div>
      </div>

      {/* 3. NAVIGATION LINKS */}
      <nav className="usr-nav-menu">
        <Link
          to="/user/dashboard"
          className={`usr-nav-link ${isActive("/user/dashboard")}`}
        >
          <FaHome /> Dashboard
        </Link>
        <Link
          to="/user/past-papers"
          className={`usr-nav-link ${isActive("/user/past-papers")}`}
        >
          <FaFileAlt /> Past Papers
        </Link>
        <Link
          to="/user/settings"
          className={`usr-nav-link ${isActive("/user/settings")}`}
        >
          <FaUserCog /> Settings
        </Link>
      </nav>

      {/* 4. FOOTER (Upgrade & Theme) */}
      <div className="usr-sidebar-footer">
        {user.planType === "free" && (
          <button className="usr-btn-upgrade">
            <FaCrown /> Upgrade
          </button>
        )}

        <div className="usr-footer-actions">
          <button
            className="usr-icon-btn"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            className="usr-icon-btn usr-danger"
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
