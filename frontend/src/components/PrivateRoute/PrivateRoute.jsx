import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { FaSpinner } from "react-icons/fa";

const PrivateRoute = () => {
  const { user, authLoading } = useUser();

  // 1. Agar abhi check kar raha hai (Refresh case)
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <FaSpinner className="icon-spin" size={40} />
      </div>
    );
  }

  // 2. Agar User login hai -> To andar jane do (<Outlet />)
  // 3. Agar User login nahi hai -> To Login page par phenk do
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
