import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const PublicRoute = () => {
  const { user, authLoading } = useUser();

  // 1. WAITING
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // 2. REDIRECT: If user is already logged in
  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // 3. SHOW: Login/Register page
  return <Outlet />;
};

export default PublicRoute;
