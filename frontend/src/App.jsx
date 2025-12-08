import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "react-hot-toast"; // Using React Hot Toast
// Components
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ManageSubjects from "./pages/Admin/ManageSubjects/ManageSubjects";
import QuestionBank from "./pages/Admin/QuestionBank/QuestionBank";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import RecentActivity from "./pages/Admin/RecentActivity/RecentActivity";

// Security Guards
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";

const App = () => {
  const location = useLocation();

  // Logic: Agar URL '/admin' se shuru ho rha hai, to Navbar mat dikhao
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <div>
      <UserProvider>
        {!isAdminRoute && <Navbar />}
        {/* Global Toaster for notifications */}
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<Home />} />

          {/* 🛡️ PUBLIC ROUTES (Only for Non-Logged In Users) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* 🔐 ADMIN ROUTES (Only for Admins) */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/subjects" element={<ManageSubjects />} />
              <Route path="/admin/question-bank" element={<QuestionBank />} />
              <Route
                path="/admin/recent-activity"
                element={<RecentActivity />}
              />
            </Route>
          </Route>

          {/* Add other pages like About/Contact */}
        </Routes>
      </UserProvider>
    </div>
  );
};

export default App;
