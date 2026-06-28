import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Loader from "../ui/Loader";

const PublicRoute = () => {
  const { user, authLoading } = useUser();

  // 1. Agar backend se check ho raha hai, toh global loader dikhao
  if (authLoading) {
    return <Loader fullScreen={true} text="Verifying..." />;
  }

  // 2. Agar user logged in hai, toh uske role ke hisaab se redirect karo
  if (user) {
    if (user.isSuperAdmin || user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  // 3. Agar guest hai, toh page access karne do (Login/Register/Home)
  return <Outlet />;
};

export default PublicRoute;
