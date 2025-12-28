import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
// ❌ FaSpinner Removed

// ✅ Import Custom TM Loader
// Path check kar lena agar components folder door ho
import TMLoader from "../../components/common/TMLoader/TMLoader";

const PrivateRoute = () => {
  const { user, authLoading } = useUser();

  // 1. Agar abhi check kar raha hai (Refresh case)
  if (authLoading) {
    // ✅ Replace Old Spinner with TM Loader
    return <TMLoader message="Verifying User..." />;
  }

  // 2. Agar User login hai -> To andar jane do (<Outlet />)
  // 3. Agar User login nahi hai -> To Login page par phenk do
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
