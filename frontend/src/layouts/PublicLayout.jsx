import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollToTop from "../components/ui/ScrollToTop.jsx";
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-body text-main transition-colors duration-300">
      <Navbar />

      {/* Main content of public pages */}
      <main className="flex-1 w-full pt-24">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default PublicLayout;
