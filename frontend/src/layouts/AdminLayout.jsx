import React from "react";
import { Outlet } from "react-router-dom";
// import Sidebar from "../../components/Admin/Dashboard/Sidebar/Sidebar"; // Uncomment when ready

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-bg-body overflow-x-hidden transition-colors duration-300">
      {/* 1. Sidebar (Fixed) */}
      {/* <Sidebar /> */}
      <div className="w-65 bg-sidebar-bg border-r border-border hidden lg:block">
        {/* Temporary placeholder for Sidebar */}
        <p className="p-4 text-muted">Admin Sidebar</p>
      </div>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col pt-15 w-full min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
