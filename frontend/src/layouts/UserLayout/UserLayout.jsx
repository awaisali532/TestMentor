import React, { useState, useEffect } from "react";
import UserSidebar from "../../components/User/UserSidebar/UserSidebar";
import NotificationPanel from "../../components/User/NotificationPanel/NotificationPanel";
import "./UserLayout.css";

const UserLayout = ({ children }) => {
  // --- THEME STATE ---
  // Default Dark Mode rakha hai, chahein to localStorage se persistence add kar skte hain
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    // "u-dark" ya "u-light" class add hogi based on state
    <div className={`usr-layout-wrapper ${isDarkMode ? "u-dark" : "u-light"}`}>
      {/* Left Sidebar (Pass theme props) */}
      <aside className="usr-layout-sidebar">
        <UserSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </aside>

      {/* Main Content (Center) */}
      <main className="usr-layout-main">{children}</main>

      {/* Right Notification Panel */}
      <aside className="usr-layout-right">
        <NotificationPanel />
      </aside>
    </div>
  );
};

export default UserLayout;
