import React, { useState } from "react";
import { Outlet } from "react-router-dom";

// Components
import UserSidebar from "../components/layout/User/UserSidebar";
import Topbar from "../components/layout/User/Topbar";

const UserLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // ✅ Sidebar Collapse State

  return (
    <div className="flex h-screen bg-bg-body overflow-hidden transition-colors duration-300">
      {/* 1. LEFT SIDEBAR (Floating & Collapsible) */}
      <UserSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-transparent transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* 3. MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default UserLayout;
