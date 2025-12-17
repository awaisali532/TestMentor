import React, { useState } from "react";
import UserSidebar from "../../components/User/UserSidebar/UserSidebar";
import NotificationPanel from "../../components/User/NotificationPanel/NotificationPanel";
import { FaBars } from "react-icons/fa"; // Hamburger Icon
import "./UserLayout.css";

const UserLayout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. Sidebar Collapse State (Desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 2. Mobile Sidebar State
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div
      className={`usr-layout-wrapper ${isDarkMode ? "u-dark" : "u-light"} ${
        isCollapsed ? "usr-collapsed" : ""
      }`}
    >
      {/* --- MOBILE OVERLAY (Backdrop) --- */}
      {isMobileOpen && (
        <div
          className="usr-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* --- LEFT SIDEBAR --- */}
      <aside
        className={`usr-layout-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
      >
        <UserSidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          closeMobileMenu={() => setIsMobileOpen(false)} // Close on link click (Mobile)
        />
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="usr-layout-main">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="usr-mobile-header">
          <button className="usr-hamburger-btn" onClick={toggleMobileMenu}>
            <FaBars />
          </button>
          <h4 className="m-0">
            Test<span style={{ color: "var(--u-accent)" }}>Mentor</span>
          </h4>
        </div>

        {children}
      </main>

      {/* --- RIGHT PANEL --- */}
      <aside className="usr-layout-right">
        <NotificationPanel />
      </aside>
    </div>
  );
};

export default UserLayout;
