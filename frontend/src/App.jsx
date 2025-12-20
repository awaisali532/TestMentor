import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { UIProvider } from "./context/UIContext"; // ✅ Context Import
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar/Navbar";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import UserLayout from "./layouts/UserLayout/UserLayout";

// Pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Subjects from "./pages/Subjects/Subjects";
import SubjectDetails from "./pages/Subjects/SubjectDetails/SubjectDetails";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import ManageSubjects from "./pages/Admin/ManageSubjects/ManageSubjects";
import QuestionBank from "./pages/Admin/QuestionBank/QuestionBank";
import RecentActivity from "./pages/Admin/RecentActivity/RecentActivity";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import ProfileSettings from "./pages/Admin/ProfileSettings/ProfileSettings";
import SiteSettings from "./pages/Admin/SiteSettings/SiteSettings";
import PaperPatterns from "./pages/Admin/PaperPatterns/PaperPatterns"; // ✅ Import Patterns
import PaperWizard from "./pages/User/PaperWizard/PaperWizard";
import UserDashboard from "./pages/User/UserDashboard/UserDashboard";
import UserSettings from "./pages/User/UserSettings/UserSettings";

const App = () => {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/user");

  return (
    <ThemeProvider>
      <UserProvider>
        <UIProvider>
          {!isDashboardRoute && <Navbar />}

          {/* ✅ TOAST STYLING FIXED HERE */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: "var(--card-bg)", // Dark/Light Theme Support
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "white" },
              },
              error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ADMIN ROUTES */}
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
                <Route path="/admin/site-settings" element={<SiteSettings />} />
                <Route
                  path="/admin/paper-patterns"
                  element={<PaperPatterns />}
                />
              </Route>
            </Route>

            {/* USER ROUTES */}
            <Route element={<PrivateRoute />}>
              <Route
                path="/user/dashboard"
                element={
                  <UserLayout>
                    <UserDashboard />
                  </UserLayout>
                }
              />
              <Route
                path="/user/settings"
                element={
                  <UserLayout>
                    <UserSettings />
                  </UserLayout>
                }
              />
              <Route
                path="/user/past-papers"
                element={
                  <UserLayout>
                    <div className="p-4">Past Papers Coming Soon...</div>
                  </UserLayout>
                }
              />
              <Route path="/user/generate-paper" element={<PaperWizard />} />
            </Route>
          </Routes>
        </UIProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
