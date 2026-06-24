import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const AdminRoute = () => {
  // ✅ Get authLoading from context
  const { user, authLoading } = useUser();

  // 1. WAITING: If context is still checking localStorage, show nothing (or a spinner)
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // 2. CHECK: Not Logged In -> Login Page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. CHECK: Logged in but NOT Admin -> Home Page
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 4. SUCCESS: Admin -> Access Granted
  return <Outlet />;
};

export default AdminRoute;
