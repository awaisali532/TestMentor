import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Admin/Dashboard/Sidebar/Sidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout-container">
      {/* 1. Sidebar (Fixed Position) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
