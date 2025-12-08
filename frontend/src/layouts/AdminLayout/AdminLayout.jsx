import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Admin/Dashboard/Sidebar/Sidebar"; // Adjust path to your Sidebar
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout-container">
      {/* 1. Sidebar Hamesha Yahan Rahega */}
      <Sidebar />

      {/* 2. Right Side Content Area */}
      <div className="admin-main-content">
        {/* <Outlet /> wo jagah hai jahan Dashboard/QuestionBank render honge */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
