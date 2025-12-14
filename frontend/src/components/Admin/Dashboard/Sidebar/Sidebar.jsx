import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../../context/UserContext"; // Ensure path is correct
import { MdSpaceDashboard } from "react-icons/md";
import {
  FaFolder,
  FaBook,
  FaUser,
  FaUserCog,
  FaSignOutAlt,
  FaHistory,
  FaLock,
  FaBars,
  FaCogs, // ✅ Used for Site Settings
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useUser();

  // ✅ State: Desktop (Open by default), Mobile (Closed by default)
  const [isOpen, setIsOpen] = useState(window.innerWidth > 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  // Screen Resize Listener (To auto-adjust)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true); // Force open on desktop resize
      else setIsOpen(false); // Force close on mobile resize
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper to toggle sidebar
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Close only if mobile
  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const canAccess = (perm) => {
    if (!user) return false;
    if (
      user.role === "admin" &&
      (user.isSuperAdmin || user.permissions?.includes(perm))
    ) {
      return true;
    }
    return false;
  };

  const SidebarItem = ({ to, icon: Icon, label, permission }) => {
    const hasAccess = !permission || canAccess(permission);
    const linkActive = isActive(to);

    return (
      <li>
        {hasAccess ? (
          <Link
            to={to}
            className={`menu-link ${linkActive}`}
            onClick={handleLinkClick}
            title={!isOpen && !isMobile ? label : ""} // Tooltip when collapsed
          >
            <Icon className="menu-icon" />
            {/* Show Text only if Open */}
            <span
              className={`link-text ${!isOpen && !isMobile ? "d-none" : ""}`}
            >
              {label}
            </span>
          </Link>
        ) : (
          <div
            className="menu-link disabled-link"
            title="Access Denied"
            style={{ cursor: "not-allowed", opacity: 0.5 }}
          >
            <Icon className="menu-icon" />
            <span
              className={`d-flex justify-content-between align-items-center w-100 link-text ${
                !isOpen && !isMobile ? "d-none" : ""
              }`}
            >
              {label} <FaLock size={10} />
            </span>
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      {/* =========================================
          ✅ 1. FIXED TOP BAR (Modern Header)
      ========================================= */}
      <div className="top-header">
        <div className="d-flex align-items-center">
          {/* Toggle Button */}
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>

          {/* Brand Logo */}
          <h3 className="brand-logo m-0 ms-3">
            QuestBank <span className="brand-subtitle">Admin</span>
          </h3>
        </div>
      </div>

      {/* =========================================
          ✅ 2. SIDEBAR CONTAINER
      ========================================= */}

      {/* Mobile Overlay (Click to close) */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <div
        className={`sidebar ${isOpen ? "open" : "collapsed"} ${
          isMobile ? "mobile" : "desktop"
        }`}
      >
        {/* Menu Items */}
        <ul className="sidebar-menu">
          <SidebarItem
            to="/admin/dashboard"
            icon={MdSpaceDashboard}
            label="Dashboard"
          />

          <SidebarItem
            to="/admin/question-bank"
            icon={FaFolder}
            label="Question Bank"
            permission="manage_questions"
          />

          <SidebarItem
            to="/admin/subjects"
            icon={FaBook}
            label="Manage Subjects"
            permission="manage_subjects"
          />

          <SidebarItem
            to="/admin/users"
            icon={FaUser}
            label="User Management"
            permission="manage_users"
          />

          {/* ✅ NEW: Site Settings (Super Admin Only) */}
          {user && user.isSuperAdmin && (
            <SidebarItem
              to="/admin/site-settings"
              icon={FaCogs}
              label="Site Settings"
            />
          )}

          <SidebarItem
            to="/admin/recent-activity"
            icon={FaHistory}
            label="Recent Activity"
          />

          <SidebarItem
            to="/admin/profile-settings"
            icon={FaUserCog}
            label="Profile & Settings"
          />
        </ul>

        {/* Footer (Logout) */}
        <div className="sidebar-footer">
          <button
            onClick={logout}
            className="btn btn-danger w-100 d-flex justify-content-center align-items-center"
          >
            <FaSignOutAlt className="menu-icon" />
            <span
              className={`link-text ${!isOpen && !isMobile ? "d-none" : ""}`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
