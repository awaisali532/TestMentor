import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext"; // Ensure path is correct
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
  const { logout } = useUser(); // Using Context for logout

  // Safe Retrieve User
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    planType: "free",
    subscription: { validUntil: null },
  };

  // Helper for active class
  const isActive = (path) => (location.pathname === path ? "usr-active" : "");

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ LOGOUT FIXED (Robust)
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // 1. Context Logout (if available)
      if (logout) logout();

      // 2. Manual Cleanup
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.clear();

      // 3. Force Redirect & Reload to clear states
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  return (
    <div
      className={`usr-sidebar-container ${isCollapsed ? "collapsed-mode" : ""}`}
    >
      {/* COLLAPSE TOGGLE BUTTON (Desktop Only) */}
      <button className="usr-collapse-btn" onClick={toggleCollapse}>
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* 1. BRAND */}
      <div className="usr-brand">
        {isCollapsed ? (
          <h3 className="brand-short">TM</h3>
        ) : (
          <h3>
            Test<span className="brand-accent">Mentor</span>
          </h3>
        )}
      </div>

      {/* 2. PROFILE SECTION */}
      <div className="usr-profile-card">
        <div className="usr-avatar-container">
          <div className="usr-avatar">{user.name.charAt(0).toUpperCase()}</div>
          {!isCollapsed && <div className="online-dot"></div>}
        </div>

        {/* Hide Info when Collapsed */}
        {!isCollapsed && (
          <div className="usr-info fade-in">
            <h5 className="usr-name">{user.name}</h5>
            {user.planType === "paid" ? (
              <>
                <span className="usr-badge usr-badge-paid">
                  <FaCrown size={10} /> Premium
                </span>
                <span className="usr-validity">
                  Exp: {formatDate(user.subscription?.validUntil)}
                </span>
              </>
            ) : (
              <span className="usr-badge usr-badge-free">Free Plan</span>
            )}
          </div>
        )}
      </div>

      {/* 3. NAVIGATION */}
      <nav className="usr-nav-menu">
        <Link
          to="/user/dashboard"
          className={`usr-nav-link ${isActive("/user/dashboard")}`}
          onClick={closeMobileMenu}
        >
          <FaHome size={20} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
        <Link
          to="/user/past-papers"
          className={`usr-nav-link ${isActive("/user/past-papers")}`}
          onClick={closeMobileMenu}
        >
          <FaFileAlt size={20} />
          {!isCollapsed && <span>Past Papers</span>}
        </Link>
        <Link
          to="/user/settings"
          className={`usr-nav-link ${isActive("/user/settings")}`}
          onClick={closeMobileMenu}
        >
          <FaUserCog size={20} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </nav>

      {/* 4. FOOTER */}
      <div className="usr-sidebar-footer">
        {user.planType === "free" && !isCollapsed && (
          <button className="usr-btn-upgrade fade-in">
            <FaCrown /> Upgrade
          </button>
        )}

        <div className={`usr-footer-actions ${isCollapsed ? "col-mode" : ""}`}>
          <button className="usr-icon-btn" onClick={toggleTheme} title="Theme">
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
