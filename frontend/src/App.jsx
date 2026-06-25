import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// =================================================================
// 1. CONTEXT PROVIDERS (Uncomment when context is ready)
// =================================================================
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { UIProvider } from "./context/UIContext";

// =================================================================
// 2. LAYOUTS (Uncomment as we build them)
// =================================================================
import PublicLayout from "./layouts/PublicLayout";
// import AdminLayout from "./layouts/AdminLayout";
// import UserLayout from "./layouts/UserLayout";

// =================================================================
// 3. ROUTE GUARDS
// =================================================================
// import PublicRoute from "./components/PublicRoute/PublicRoute";
// import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
// import AdminRoute from "./components/AdminRoute/AdminRoute";

// =================================================================
// 4. PAGES (Uncomment as we build them)
// =================================================================
import Home from "./pages/Home/Home";
// import About from "./pages/About/About";
// import Contact from "./pages/Contact/Contact";
// import Subjects from "./pages/Subjects/Subjects";
// import SubjectDetails from "./pages/Subjects/SubjectDetails/SubjectDetails";
// import Login from "./pages/Auth/Login";
// import Register from "./pages/Auth/Register";
// import ForgotPassword from "./pages/Auth/ForgotPassword";

const AppContent = () => {
  return (
    <>
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
          success: { iconTheme: { primary: "#10b981", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />

      <Routes>
        {/* =========================================
            1. PUBLIC ROUTES (Wrapped in PublicLayout)
            ========================================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetails />} /> */}
        </Route>

        {/* =========================================
            2. AUTH ROUTES (No Navbar usually)
            ========================================= */}
        {/* <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route> */}

        {/* =========================================
            3. ADMIN ROUTES
            ========================================= */}
        {/* <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            // Add other Admin routes here
          </Route>
        </Route> */}

        {/* =========================================
            4. USER ROUTES
            ========================================= */}
        {/* <Route element={<PrivateRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            // Add other User routes here
          </Route>
        </Route> */}
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
