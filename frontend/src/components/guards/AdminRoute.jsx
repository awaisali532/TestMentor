import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Loader from "../ui/Loader";

const AdminRoute = () => {
  const { user, authLoading } = useUser();

  // 1. Checking state
  if (authLoading) {
    return <Loader fullScreen={true} text="Verifying Admin..." />;
  }

  // 2. Agar login hi nahi hai, toh login par bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Agar login hai par admin nahi hai, toh home par bhejo
  if (user.role !== "admin" && !user.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Success -> Access Granted
  return <Outlet />;
};

export default AdminRoute;
