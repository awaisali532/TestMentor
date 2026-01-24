import React, { useState, useEffect } from "react";
import UserSidebar from "../../components/User/UserSidebar/UserSidebar";
import NotificationPanel from "../../components/User/NotificationPanel/NotificationPanel";
import { FaBars, FaBell, FaTimes } from "react-icons/fa";
import "./UserLayout.css";

const UserLayout = ({ children }) => {
  // --- STATES ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mobile Drawers State
  const [isLeftOpen, setIsLeftOpen] = useState(false); // Hamburger Menu
  const [isRightOpen, setIsRightOpen] = useState(false); // Notification Panel

  const [badgeCount, setBadgeCount] = useState(0);

  // Auto-Close Notifications (60 Secs)
  useEffect(() => {
    let timer;
    if (isRightOpen) {
      timer = setTimeout(() => {
        setIsRightOpen(false);
      }, 60000);
    }
    return () => clearTimeout(timer);
  }, [isRightOpen]);

  // --- HANDLERS ---
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Mobile Handlers (Ensure one closes when other opens)
  const toggleLeftMenu = () => {
    setIsLeftOpen(!isLeftOpen);
    if (isRightOpen) setIsRightOpen(false); // Close right if open
  };

  const toggleRightPanel = () => {
    if (!isRightOpen) {
      setIsRightOpen(true);
      if (isLeftOpen) setIsLeftOpen(false); // Close left if open
      setBadgeCount(0); // Reset Badge on Open
    } else {
      setIsRightOpen(false);
    }
  };

  const closeAllDrawers = () => {
    setIsLeftOpen(false);
    setIsRightOpen(false);
  };

  return (
    <div
      className={`usr-layout-wrapper ${isDarkMode ? "u-dark" : "u-light"} 
      ${isCollapsed ? "usr-collapsed" : ""} 
      ${isRightOpen ? "usr-right-open" : "usr-right-closed"}`}
    >
      {/* 🌑 BACKDROP (Visible only on Mobile when any drawer is open) */}
      {(isLeftOpen || isRightOpen) && (
        <div
          className="usr-mobile-backdrop d-lg-none"
          onClick={closeAllDrawers}
        ></div>
      )}

      {/* 👈 LEFT SIDEBAR (Hamburger Menu) */}
      <aside
        className={`usr-layout-sidebar ${isLeftOpen ? "mobile-open" : ""}`}
      >
        <UserSidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          closeMobileMenu={() => setIsLeftOpen(false)}
        />
      </aside>

      {/* 🏠 MAIN CONTENT */}
      <main className="usr-layout-main">
        {/* 📱 MOBILE HEADER (Hamburger Left - Logo Center - Bell Right) */}
        <div className="usr-mobile-header">
          {/* Left: Hamburger */}
          <button className="usr-hamburger-btn" onClick={toggleLeftMenu}>
            <FaBars />
          </button>

          {/* Center: Logo */}
          <h4 className="m-0 fw-bold">
            Test<span style={{ color: "var(--u-accent)" }}>Mentor</span>
          </h4>

          {/* Right: Notification Bell */}
          <button className="mobile-bell-btn" onClick={toggleRightPanel}>
            {isRightOpen ? (
              <FaTimes className="text-danger" />
            ) : (
              <FaBell className={badgeCount > 0 ? "bell-shake" : ""} />
            )}
            {!isRightOpen && badgeCount > 0 && (
              <span className="layout-badge-mobile">{badgeCount}</span>
            )}
          </button>
        </div>

        {/* 💻 DESKTOP BELL (Absolute Top Right) */}
        <button
          className={`desktop-bell-btn ${isRightOpen ? "active" : ""}`}
          onClick={toggleRightPanel}
          title={isRightOpen ? "Close" : "Notifications"}
        >
          {isRightOpen ? (
            <FaTimes size={20} />
          ) : (
            <FaBell size={20} className={badgeCount > 0 ? "bell-shake" : ""} />
          )}
          {!isRightOpen && badgeCount > 0 && (
            <span className="layout-badge">{badgeCount}</span>
          )}
        </button>

        {/* Page Content Scrollable Area */}
        <div className="usr-content-scroll">{children}</div>
      </main>

      {/* 👉 RIGHT PANEL (Notifications) */}
      <aside className="usr-layout-right">
        <NotificationPanel
          isOpen={isRightOpen}
          onUpdateCount={(count) => setBadgeCount(count)}
          onClose={() => setIsRightOpen(false)}
        />
      </aside>
    </div>
  );
};

export default UserLayout;
