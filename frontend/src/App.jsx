import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet, // ✅ 1. Outlet yahan import karna zaroori tha
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";

// =================================================================
// 1. CONTEXT PROVIDERS
// =================================================================
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { UIProvider } from "./context/UIContext";

// =================================================================
// 2. LAYOUTS
// =================================================================
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// =================================================================
// 3. ROUTE GUARDS
// =================================================================
import PublicRoute from "./components/guards/PublicRoute";
import PrivateRoute from "./components/guards/PrivateRoute";
import AdminRoute from "./components/guards/AdminRoute";

// =================================================================
// 4. PAGES
// =================================================================
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Subjects from "./pages/Subjects/Subjects";
import SubjectDetails from "./pages/SubjectDetails/SubjectDetails";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// User Pages
import UserDashboard from "./pages/User/Dashboard/UserDashboard";
import UserSettings from "./pages/User/Settings/UserSettings";
import SavedPapers from "./pages/User/SavedPapers/SavedPapers";
import GeneratePaper from "./pages/User/GeneratePaper/GeneratePaper";
import PaperMaker from "./pages/User/PaperMaker/PaperMaker";
import PrintLayout from "./pages/User/PrintLayout/PrintLayout";
import AutoPaper from "./pages/User/AutoPaper/AutoPaper";

// Admin Pages (Exact 9 Options)
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import QuestionBank from "./pages/Admin/QuestionBank/QuestionBank";
import AdminSubjects from "./pages/Admin/Subjects/AdminSubjects";
import PaperPatterns from "./pages/Admin/PaperPatterns/PaperPatterns";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import SiteSettings from "./pages/Admin/SiteSettings/SiteSettings";
import RecentActivity from "./pages/Admin/RecentActivity/RecentActivity";
import ProfileSettings from "./pages/Admin/ProfileSettings/ProfileSettings";
import AdminNotifications from "./pages/Admin/Notifications/AdminNotifications";

// =================================================================
// 5. DATA ROUTER CONFIGURATION
// =================================================================
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <>
          <ScrollToTop />
          <Outlet />
        </>
      }
    >
      {/* =========================================
        1. PUBLIC ROUTES (Wrapped in PublicLayout)
        ========================================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:id" element={<SubjectDetails />} />
      </Route>

      {/* =========================================
        2. AUTH ROUTES
        ========================================= */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* =========================================
        3. ADMIN ROUTES (Protected by AdminRoute & AdminLayout)
        ========================================= */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/question-bank" element={<QuestionBank />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/paper-patterns" element={<PaperPatterns />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/site-settings" element={<SiteSettings />} />
          <Route path="/admin/recent-activity" element={<RecentActivity />} />
          <Route path="/admin/profile-settings" element={<ProfileSettings />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>
      </Route>

      {/* =========================================
        4. USER ROUTES
        ========================================= */}
      <Route element={<PrivateRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/settings" element={<UserSettings />} />
          <Route path="/user/saved-papers" element={<SavedPapers />} />
          <Route path="/user/generate-paper" element={<GeneratePaper />} />
          {/* <Route path="/user/paper-maker" element={<PaperMaker />} /> */}
        </Route>
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/user/paper-maker" element={<PaperMaker />} />
        <Route path="/user/print-paper" element={<PrintLayout />} />
        <Route path="/user/auto-paper" element={<AutoPaper />} />
      </Route>
    </Route>,
  ),
);

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <UIProvider>
          {/* Global Notifications */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: "var(--color-card)",
                color: "var(--color-main)",
                border: "1px solid var(--color-border)",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "white" },
              },
              error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
            }}
          />

          {/* Main Routing Engine */}
          <RouterProvider router={router} />
        </UIProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
