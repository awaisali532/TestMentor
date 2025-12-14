import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "react-hot-toast";
// Components
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ManageSubjects from "./pages/Admin/ManageSubjects/ManageSubjects";
import QuestionBank from "./pages/Admin/QuestionBank/QuestionBank";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import RecentActivity from "./pages/Admin/RecentActivity/RecentActivity";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import ProfileSettings from "./pages/Admin/ProfileSettings/ProfileSettings";
import Subjects from "./pages/Subjects/Subjects";
import SubjectDetails from "./pages/Subjects/SubjectDetails/SubjectDetails";
// Security Guards
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import { ThemeProvider } from "./context/ThemeContext";
const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div>
      <ThemeProvider>
        <UserProvider>
          {!isAdminRoute && <Navbar />}
          <Toaster position="top-right" reverseOrder={false} />

          <Routes>
            {/* ✅ OPEN ROUTES (Accessible to Everyone) */}
            <Route path="/" element={<Home />} />
            <Route path="/subjects" element={<Subjects />} />{" "}
            <Route path="/subjects/:id" element={<SubjectDetails />} />
            {/* 👈 Yahan shift kar dain */}
            {/* 🛡️ PUBLIC ROUTES (Only for Non-Logged In Users like Login/Register) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Subjects yahan se hata diya */}
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
                <Route path="/admin/users" element={<UserManagement />} />
                <Route
                  path="/admin/profile-settings"
                  element={<ProfileSettings />}
                />
              </Route>
            </Route>
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
