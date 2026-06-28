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
// import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// =================================================================
// 3. ROUTE GUARDS
// =================================================================
import PublicRoute from "./components/guards/PublicRoute";
import PrivateRoute from "./components/guards/PrivateRoute";
// import AdminRoute from "./components/AdminRoute/AdminRoute";

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

//User Pages
import UserDashboard from "./pages/User/Dashboard/UserDashboard";
import UserSettings from "./pages/User/Settings/UserSettings";
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
      {/* ✅ 2. Yahan se extra <> aur </> fragments nikal diye hain */}

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
        3. ADMIN ROUTES
        ========================================= */}
      {/* <Route element={<AdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Route>
    </Route> */}

      {/* =========================================
        4. USER ROUTES
        ========================================= */}
      <Route element={<PrivateRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/settings" element={<UserSettings />} />
        </Route>
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
