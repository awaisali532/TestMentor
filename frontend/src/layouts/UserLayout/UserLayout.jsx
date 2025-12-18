import React, { useState } from "react";
import UserSidebar from "../../components/User/UserSidebar/UserSidebar";
import NotificationPanel from "../../components/User/NotificationPanel/NotificationPanel";
import { FaBars } from "react-icons/fa";
import "./UserLayout.css";

const UserLayout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Desktop Collapse State
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mobile/Tablet Drawer State
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
      {/* --- OVERLAY BACKDROP (Click to close menu) --- */}
      {isMobileOpen && (
        <div
          className="usr-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR (Becomes Drawer on <=1024px) --- */}
      <aside
        className={`usr-layout-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
      >
        <UserSidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          // Jab link par click ho, to drawer band ho jaye
          closeMobileMenu={() => setIsMobileOpen(false)}
        />
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="usr-layout-main">
        {/* HAMBURGER HEADER (Visible on <=1024px) */}
        <div className="usr-mobile-header">
          <button className="usr-hamburger-btn" onClick={toggleMobileMenu}>
            <FaBars />
          </button>
          <h4 className="m-0" style={{ fontWeight: "700" }}>
            Test<span style={{ color: "var(--u-accent)" }}>Mentor</span>
          </h4>
        </div>

        {children}
      </main>

      {/* --- RIGHT PANEL (Hidden on <=1024px via CSS) --- */}
      <aside className="usr-layout-right">
        <NotificationPanel />
      </aside>
    </div>
  );
};

export default UserLayout;
