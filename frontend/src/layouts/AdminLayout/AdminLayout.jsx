import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Admin/Dashboard/Sidebar/Sidebar"; // Verify this path
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout-container">
      {/* 1. Sidebar (Includes the TopBar) */}
      <Sidebar />

      {/* 2. Main Content Area (Where pages load) */}
      <div className="admin-main-content">
        {/* <Outlet /> is the placeholder where Dashboard, Users, etc., appear */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
