import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/layout/Admin/AdminSidebar";
import AdminTopbar from "../components/layout/Admin/AdminTopbar";

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-bg-body overflow-hidden transition-colors duration-300">
      {/* 1. LEFT ADMIN SIDEBAR */}
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent transition-colors duration-300 pb-16 sm:pb-8">
          <Outlet />
        </main>
      </div>

      {/* 3. MOBILE BACKDROP OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
