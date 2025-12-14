import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { useTheme } from "../../../../context/ThemeContext"; // ✅ Theme Hook
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
  FaCogs,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme(); // ✅ Get Theme

  // ✅ State: Desktop (Open by default), Mobile (Closed by default)
  const [isOpen, setIsOpen] = useState(window.innerWidth > 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  // Screen Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
      else setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };
  const isActive = (path) => (location.pathname === path ? "active" : "");

  const canAccess = (perm) => {
    if (!user) return false;
    if (
      user.role === "admin" &&
      (user.isSuperAdmin || user.permissions?.includes(perm))
    )
      return true;
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
            title={!isOpen && !isMobile ? label : ""}
          >
            <div className="icon-box">
              <Icon className="menu-icon" />
            </div>
            <span
              className={`link-text ${!isOpen && !isMobile ? "d-none" : ""}`}
            >
              {label}
            </span>
          </Link>
        ) : (
          <div className="menu-link disabled-link" title="Access Denied">
            <div className="icon-box">
              <Icon className="menu-icon" />
            </div>
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
      {/* 1. FIXED TOP BAR */}
      <div className="top-header">
        <div className="d-flex align-items-center">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h3 className="brand-logo m-0 ms-3">
            QuestBank <span className="brand-subtitle">Admin</span>
          </h3>
        </div>
      </div>

      {/* 2. SIDEBAR CONTAINER */}
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

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-sidebar-action theme-toggle mb-2"
          >
            <div className="icon-box">
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </div>
            <span
              className={`link-text ${!isOpen && !isMobile ? "d-none" : ""}`}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>

          {/* Logout Button */}
          <button onClick={logout} className="btn-sidebar-action logout-btn">
            <div className="icon-box">
              <FaSignOutAlt />
            </div>
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
