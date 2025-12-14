import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar/Navbar";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";

// Pages - Public
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Subjects from "./pages/Subjects/Subjects";
import SubjectDetails from "./pages/Subjects/SubjectDetails/SubjectDetails";

// Pages - Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Pages - Admin
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import ManageSubjects from "./pages/Admin/ManageSubjects/ManageSubjects";
import QuestionBank from "./pages/Admin/QuestionBank/QuestionBank";
import RecentActivity from "./pages/Admin/RecentActivity/RecentActivity";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import ProfileSettings from "./pages/Admin/ProfileSettings/ProfileSettings";
import SiteSettings from "./pages/Admin/SiteSettings/SiteSettings"; // ✅ Imported

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
            {/* 🌍 OPEN ROUTES (Accessible to Everyone) */}
            <Route path="/" element={<Home />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* 🛡️ PUBLIC ROUTES (Only for Non-Logged In Users) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* 🔐 ADMIN ROUTES (Protected) */}
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

                {/* ✅ New Site Settings Route */}
                <Route path="/admin/site-settings" element={<SiteSettings />} />
              </Route>
            </Route>
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
