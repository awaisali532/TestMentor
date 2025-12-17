import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext"; // ✅ Context Import
import {
  FaHome,
  FaFileAlt,
  FaUserCog,
  FaCrown,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./UserSidebar.css";

const UserSidebar = ({
  isDarkMode,
  toggleTheme,
  isCollapsed,
  toggleCollapse,
  closeMobileMenu,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ FIX: Get 'user' directly from Context (Not LocalStorage)
  // Is se real-time update hoga bina refresh kiye.
  const { user, logout } = useUser();

  // Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Helper for active class
  const isActive = (path) => (location.pathname === path ? "usr-active" : "");

  // Helper for date format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // 1. Trigger Modal Logic
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // 2. Actual Logout Perform
  const confirmLogout = () => {
    if (logout) logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();

    navigate("/login", { replace: true });
    window.location.reload();
  };

  // Fallback for user name to prevent crash if user is null briefly
  const userName = user?.name || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <div
        className={`usr-sidebar-container ${
          isCollapsed ? "collapsed-mode" : ""
        }`}
      >
        <button className="usr-collapse-btn" onClick={toggleCollapse}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        <div className="usr-brand">
          {isCollapsed ? (
            <h3 className="brand-short">TM</h3>
          ) : (
            <h3>
              Test<span className="brand-accent">Mentor</span>
            </h3>
          )}
        </div>

        {/* --- PROFILE SECTION --- */}
        <div className="usr-profile-card">
          <div className="usr-avatar-container">
            {/* ✅ FIX: Check if image exists, show IMG tag, else show Initial */}
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="usr-avatar"
                style={{ objectFit: "cover" }} // Ensures image fits circle perfectly
              />
            ) : (
              <div className="usr-avatar">{userInitial}</div>
            )}

            {!isCollapsed && <div className="online-dot"></div>}
          </div>

          {!isCollapsed && (
            <div className="usr-info fade-in">
              <h5 className="usr-name">{userName}</h5>
              {user?.planType === "paid" ? (
                <>
                  <span className="usr-badge usr-badge-paid">
                    <FaCrown size={10} /> Premium
                  </span>
                  <span className="usr-validity">
                    Exp: {formatDate(user?.subscription?.validUntil)}
                  </span>
                </>
              ) : (
                <span className="usr-badge usr-badge-free">Free Plan</span>
              )}
            </div>
          )}
        </div>

        <nav className="usr-nav-menu">
          <Link
            to="/user/dashboard"
            className={`usr-nav-link ${isActive("/user/dashboard")}`}
            onClick={closeMobileMenu}
          >
            <FaHome size={20} /> {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link
            to="/user/past-papers"
            className={`usr-nav-link ${isActive("/user/past-papers")}`}
            onClick={closeMobileMenu}
          >
            <FaFileAlt size={20} /> {!isCollapsed && <span>Past Papers</span>}
          </Link>
          <Link
            to="/user/settings"
            className={`usr-nav-link ${isActive("/user/settings")}`}
            onClick={closeMobileMenu}
          >
            <FaUserCog size={20} /> {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        <div className="usr-sidebar-footer">
          {user?.planType === "free" && !isCollapsed && (
            <button className="usr-btn-upgrade fade-in">
              <FaCrown /> Upgrade
            </button>
          )}

          <div
            className={`usr-footer-actions ${isCollapsed ? "col-mode" : ""}`}
          >
            <button
              className="usr-icon-btn"
              onClick={toggleTheme}
              title="Theme"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="usr-icon-btn usr-danger"
              onClick={handleLogoutClick}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* --- LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="logout-overlay">
          <div className="logout-box">
            <h3 className="logout-title">Leaving already?</h3>
            <p className="logout-msg">Are you sure you want to sign out?</p>
            <div className="logout-actions">
              <button
                className="l-btn l-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="l-btn l-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSidebar;
