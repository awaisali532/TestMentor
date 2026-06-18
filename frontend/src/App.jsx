import React from "react";
import "./App.css";

import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext"; // ✅ useUser Import kiya
import { ThemeProvider } from "./context/ThemeContext";
import { UIProvider } from "./context/UIContext";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar/Navbar";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import TMLoader from "./components/common/TMLoader/TMLoader"; // ✅ TMLoader Import kiya

import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import UserLayout from "./layouts/UserLayout/UserLayout";

// Pages - General
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Subjects from "./pages/Subjects/Subjects";
import SubjectDetails from "./pages/Subjects/SubjectDetails/SubjectDetails";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Pages - Admin
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import ManageSubjects from "./pages/Admin/ManageSubjects/ManageSubjects";
import QuestionBank from "./pages/Admin/QuestionBank/QuestionBank";
import RecentActivity from "./pages/Admin/RecentActivity/RecentActivity";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import ProfileSettings from "./pages/Admin/ProfileSettings/ProfileSettings";
import SiteSettings from "./pages/Admin/SiteSettings/SiteSettings";
import PaperPatterns from "./pages/Admin/PaperPatterns/PaperPatterns";
import ManageNotifications from "./components/Admin/Dashboard/ManageNotifications/ManageNotifications";

// Pages - User
import PaperWizard from "./pages/User/PaperGeneration/PaperGeneration";
import UserDashboard from "./pages/User/UserDashboard/UserDashboard";
import UserSettings from "./pages/User/UserSettings/UserSettings";
import PaperMaker from "./pages/User/PaperMaker/PaperMaker";
import SavedPapers from "./pages/User/SavedPapers/SavedPapers";
import ViewPaper from "./pages/User/ViewPaper/ViewPaper";
import AutoPaper from "./pages/User/AutoPaper/AutoPaper";
import PracticeMode from "./pages/User/PracticeMode/PracticeMode";

// Print Layout
import PrintLayout from "./pages/User/PrintPaper/PrintLayout";

// =================================================================
// 🚀 CHILD COMPONENT: AppContent (Isme logic hogi)
// =================================================================
const AppContent = () => {
  const location = useLocation();
  const { authLoading } = useUser(); // ✅ Get Loading State

  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/user");

  // 🔥 MAGIC CHECK: Agar data load ho rha hai to sirf Loader dikhao
  if (authLoading) {
    return <TMLoader />;
  }

  return (
    <>
      {!isDashboardRoute && <Navbar />}

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "var(--card-bg)",
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/subjects" element={<ManageSubjects />} />
            <Route path="/admin/question-bank" element={<QuestionBank />} />
            <Route path="/admin/recent-activity" element={<RecentActivity />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route
              path="/admin/profile-settings"
              element={<ProfileSettings />}
            />
            <Route path="/admin/site-settings" element={<SiteSettings />} />
            <Route path="/admin/paper-patterns" element={<PaperPatterns />} />
            <Route
              path="/admin/notifications"
              element={<ManageNotifications />}
            />
          </Route>
        </Route>

        {/* USER ROUTES */}
        <Route element={<PrivateRoute />}>
          {/* Dashboard & Settings (With Layout) */}
          <Route
            path="/user/dashboard"
            element={
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            }
          />
          <Route
            path="/user/saved-papers"
            element={
              <UserLayout>
                <SavedPapers />
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
            path="/user/practice"
            element={
              <UserLayout>
                <PracticeMode />
              </UserLayout>
            }
          />

          {/* Tools (No Layout or Custom Layout) */}
          <Route path="/user/generate-paper" element={<PaperWizard />} />
          <Route path="/user/paper-maker" element={<PaperMaker />} />
          <Route path="/user/manual-maker" element={<PaperMaker />} />
          <Route path="/user/auto-paper" element={<AutoPaper />} />
          {/* View Paper */}
          <Route path="/user/view-paper/:id" element={<ViewPaper />} />

          {/* Print Paper Route */}
          <Route path="/user/print-paper" element={<PrintLayout />} />
        </Route>
      </Routes>
    </>
  );
};

// =================================================================
// 🏠 MAIN APP COMPONENT (Providers Setup)
// =================================================================
const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <UIProvider>
          {/* ✅ Saari logic AppContent mein shift kar di */}
          <AppContent />
        </UIProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
