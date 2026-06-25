import React, { useState, useEffect } from "react";
// import UserSidebar from "../../components/User/UserSidebar/UserSidebar";
// import NotificationPanel from "../../components/User/NotificationPanel/NotificationPanel";
import { Menu, Bell, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const UserLayout = ({ children }) => {
  const { theme } = useTheme(); // Use global theme, not local state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    let timer;
    if (isRightOpen) {
      timer = setTimeout(() => setIsRightOpen(false), 60000);
    }
    return () => clearTimeout(timer);
  }, [isRightOpen]);

  const toggleLeftMenu = () => {
    setIsLeftOpen(!isLeftOpen);
    if (isRightOpen) setIsRightOpen(false);
  };

  const toggleRightPanel = () => {
    if (!isRightOpen) {
      setIsRightOpen(true);
      if (isLeftOpen) setIsLeftOpen(false);
      setBadgeCount(0);
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
      className={`flex h-screen w-screen bg-bg-body text-main overflow-hidden transition-colors duration-300`}
    >
      {/* --- BACKDROP (Mobile) --- */}
      {(isLeftOpen || isRightOpen) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeAllDrawers}
        />
      )}

      {/* --- LEFT SIDEBAR (Hamburger Drawer / Fixed) --- */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 transform bg-card-bg border-r border-border transition-all duration-300 ease-in-out
          ${isLeftOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-70 lg:w-65"}
        `}
      >
        {/* <UserSidebar isCollapsed={isCollapsed} ... /> */}
        <div className="p-4">
          <p className="text-muted">User Sidebar</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* --- MOBILE HEADER --- */}
        <div className="flex lg:hidden items-center justify-between p-4 bg-card-bg border-b border-border">
          <button
            onClick={toggleLeftMenu}
            className="text-main p-2 hover:bg-pill-bg rounded-md"
          >
            <Menu size={24} />
          </button>

          <h4 className="m-0 font-bold text-lg">
            Test<span className="text-accent-1">Mentor</span>
          </h4>

          <button
            onClick={toggleRightPanel}
            className="relative p-2 text-main hover:bg-pill-bg rounded-md"
          >
            {isRightOpen ? (
              <X size={24} className="text-danger" />
            ) : (
              <Bell size={24} />
            )}
            {!isRightOpen && badgeCount > 0 && (
              <span className="absolute top-1 right-1 bg-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {badgeCount}
              </span>
            )}
          </button>
        </div>

        {/* --- DESKTOP BELL BUTTON --- */}
        <button
          onClick={toggleRightPanel}
          className={`hidden lg:flex absolute top-4 right-6 z-30 w-11 h-11 rounded-full items-center justify-center border transition-all duration-200 shadow-sm
            ${isRightOpen ? "bg-danger text-white border-danger" : "bg-card-bg text-muted border-border hover:bg-accent-1 hover:text-white hover:border-accent-1 hover:scale-105"}
          `}
        >
          {isRightOpen ? <X size={20} /> : <Bell size={20} />}
          {!isRightOpen && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-card-bg">
              {badgeCount}
            </span>
          )}
        </button>

        {/* --- CONTENT SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>

      {/* --- RIGHT NOTIFICATION PANEL --- */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-75 lg:w-[320px] bg-card-bg border-l border-border transform transition-transform duration-300 ease-in-out shadow-[-5px_0_25px_rgba(0,0,0,0.1)]
          ${isRightOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* <NotificationPanel isOpen={isRightOpen} ... /> */}
        <div className="p-4">
          <p className="text-muted">Notifications Panel</p>
        </div>
      </aside>
    </div>
  );
};

export default UserLayout;
