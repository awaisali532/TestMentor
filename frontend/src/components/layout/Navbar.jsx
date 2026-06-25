import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Path apne hisab se adjust kar lein agar navbar bahar hai
import { useTheme } from "../../context/ThemeContext";
import {
  Menu,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.isSuperAdmin || user.role === "admin") {
      return "/admin/dashboard";
    }
    return "/user/dashboard";
  };

  return (
    <>
      {/* --- PREMIUM FLOATING NAVBAR --- */}
      {/* Logic: Top par width 10/12 hai. Scroll par width 11/12 (Expand) ho jati hai */}
      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 transition-all duration-500 ease-out border border-border backdrop-blur-lg rounded-full bg-nav-bg/90
          ${
            scrolled
              ? "top-3 w-11/12 max-w-6xl h-14 shadow-lg shadow-black/5"
              : "top-6 w-10/12 max-w-5xl h-16 shadow-md"
          }
        `}
      >
        {/* LOGO */}
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight text-main"
          onClick={closeMenu}
        >
          Test{" "}
          <span className="bg-linear-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
            Mentor
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-2">
          {["/", "/about", "/contact"].map((path, idx) => {
            const labels = ["Home", "About", "Contact"];
            return (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${
                    isActive(path)
                      ? "bg-linear-to-r from-accent-1 to-accent-2 text-white shadow-md shadow-accent-1/40"
                      : "text-muted hover:text-main hover:bg-pill-bg"
                  }
                `}
              >
                {labels[idx]}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="size-9 flex items-center justify-center rounded-full bg-pill-bg border border-border text-main transition-transform duration-300 hover:rotate-45"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-500" />
            ) : (
              <Moon size={18} className="text-purple-500" />
            )}
          </button>

          {/* AUTH BUTTONS */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-md transition-transform hover:-translate-y-1 hover:shadow-cyan-500/30"
              >
                <span>Dashboard</span>
                <LayoutDashboard size={16} />
              </Link>

              <div className="flex items-center gap-2 bg-pill-bg px-3 py-1.5 rounded-full border border-border text-main font-medium">
                <User size={16} className="text-amber-500" />
                <span className="max-w-20 text-sm truncate">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-danger ml-1 hover:scale-125 transition-transform"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* 🌟 COOL LOGIN HOVER */}
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-sm font-semibold border border-border text-main hover:bg-main hover:text-bg-body transition-all duration-300"
              >
                Login
              </Link>

              {/* 🌟 ARROW REVEAL HOVER FOR GET STARTED */}
              <Link
                to="/register"
                className="group flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold bg-main text-bg-body border border-main hover:shadow-lg transition-all duration-300"
              >
                <span>Get Started</span>
                {/* Arrow pehle width 0 aur hidden hai, hover par width 4 hogi aur show hoga */}
                <div className="w-0 opacity-0 overflow-hidden group-hover:w-4 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out flex items-center">
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <div className="flex lg:hidden items-center gap-3">
          <button onClick={toggleTheme} className="text-main p-2">
            {theme === "dark" ? (
              <Sun size={20} className="text-amber-500" />
            ) : (
              <Moon size={20} className="text-purple-500" />
            )}
          </button>
          <button onClick={toggleMenu} className="text-main p-2">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* --- MOBILE DRAWER & OVERLAY --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={closeMenu}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-72 bg-bg-body border-l border-border z-50 transform transition-transform duration-400 ease-out flex flex-col
          ${isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}
        `}
      >
        <div className="flex justify-end p-5">
          <button
            onClick={closeMenu}
            className="text-main p-2 hover:rotate-90 transition-transform"
          >
            <X size={26} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-6">
          {["/", "/about", "/contact"].map((path, idx) => {
            const labels = ["Home", "About", "Contact"];
            return (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className={`block py-3 text-lg transition-colors
                  ${isActive(path) ? "text-accent-1 font-bold" : "text-main hover:text-accent-1"}
                `}
              >
                {labels[idx]}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-6 border-t border-border">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link
                to={getDashboardLink()}
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold"
              >
                Dashboard <LayoutDashboard size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-danger text-white font-semibold"
              >
                Logout <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full py-3 text-center rounded-full border border-border text-main font-semibold hover:bg-main hover:text-bg-body transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-main text-bg-body font-semibold"
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
