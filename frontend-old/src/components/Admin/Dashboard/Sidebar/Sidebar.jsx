import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { useTheme } from "../../../../context/ThemeContext";
import { useUI } from "../../../../context/UIContext"; // ✅ Import Context
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
  FaTimes,
  FaLayerGroup,
  FaBell,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { isEditing } = useUI(); // ✅ Get Editing State

  const [isOpen, setIsOpen] = useState(window.innerWidth > 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLinkClick = (e) => {
    // ✅ DISABLE LOGIC: Agar editing ho rahi hai to click na hone do
    if (isEditing) {
      e.preventDefault();
      return;
    }
    if (isMobile) setIsOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login", { replace: true });
    window.location.reload();
  };

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

    // ✅ VISUAL DISABLE STYLE
    const itemStyle = isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {};

    return (
      <li>
        {hasAccess ? (
          <Link
            to={to}
            className={`menu-link ${linkActive}`}
            onClick={handleLinkClick}
            style={itemStyle} // Apply style
            title={isEditing ? "Please save changes first" : label}
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
          <div className="menu-link disabled-link">
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

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <div
        className={`sidebar ${isOpen ? "open" : "collapsed"} ${
          isMobile ? "mobile" : "desktop"
        }`}
      >
        {isMobile && (
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom mb-2">
            <h4 className="brand-logo m-0">Menu</h4>
            <button className="toggle-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
        )}

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
            to="/admin/paper-patterns"
            icon={FaLayerGroup}
            label="Paper Patterns"
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
          <SidebarItem
            to="/admin/notifications"
            icon={FaBell}
            label="Notifications"
          />
        </ul>

        <div className="sidebar-footer">
          {/* THEME TOGGLE (Always Active) */}
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

          {/* LOGOUT (Disabled during Edit) */}
          <button
            onClick={() => !isEditing && setShowLogoutModal(true)}
            className="btn-sidebar-action logout-btn"
            style={isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
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

      {showLogoutModal && (
        <div className="admin-logout-overlay">
          <div className="admin-logout-box">
            <h4 className="logout-title">Sign Out?</h4>
            <p className="logout-msg">Are you sure you want to exit?</p>
            <div className="logout-actions">
              <button
                className="a-btn a-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="a-btn a-confirm" onClick={handleLogoutConfirm}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
