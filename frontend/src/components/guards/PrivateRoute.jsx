import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Loader from "../ui/Loader";

const PrivateRoute = () => {
  const { user, authLoading } = useUser();

  // 1. Checking state
  if (authLoading) {
    return <Loader fullScreen={true} text="Verifying Access..." />;
  }

  // 2. Logged in hai toh access do, warna login par phenk do
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
