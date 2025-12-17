import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaSignInAlt,
  FaArrowRight,
  FaTachometerAlt, // Dashboard Icon
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll Effect
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

  const isActive = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  // ✅ LOGIC: Determine Dashboard Link
  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.isSuperAdmin || user.role === "admin") {
      return "/admin/dashboard";
    }
    return "/user/dashboard";
  };

  return (
    <header className={`navbar-floating ${scrolled ? "compact" : ""}`}>
      <div className="nav-container">
        {/* LOGO */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          QuestBank <span>Pro</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="nav-center desktop-only">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/about" className={isActive("/about")}>
            About
          </Link>
          <Link to="/contact" className={isActive("/contact")}>
            Contact
          </Link>
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="nav-right desktop-only">
          {/* Theme Toggle */}
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? (
              <FaSun className="icon-sun" />
            ) : (
              <FaMoon className="icon-moon" />
            )}
          </button>

          {/* AUTH BUTTONS */}
          {user ? (
            <div className="d-flex align-items-center gap-3">
              {/* Dashboard Button */}
              <Link to={getDashboardLink()} className="btn-smart-dashboard">
                <span>Dashboard</span>
                <FaTachometerAlt className="smart-icon" />
              </Link>

              {/* Profile Pill */}
              <div className="user-profile-pill">
                <FaUserCircle className="me-2 text-warning" />
                <span className="me-2 user-name-trunc">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  className="icon-btn-logout"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          ) : (
            // No User -> Login/Register
            <div className="d-flex gap-2">
              <Link to="/login" className="btn-smart-login outline">
                Login
              </Link>
              <Link to="/register" className="btn-smart-login primary">
                <span>Get Started</span>
                <FaArrowRight className="smart-icon" />
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE ACTIONS */}
        <div className="mobile-actions d-lg-none">
          <button
            className="theme-toggle-btn mobile-theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          <div className="mobile-toggle" onClick={toggleMenu}>
            <FaBars />
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <div className={`mobile-drawer ${isOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <FaTimes className="close-icon" onClick={closeMenu} />
          </div>

          <div className="drawer-content">
            <Link to="/" className={isActive("/")} onClick={closeMenu}>
              Home
            </Link>
            <Link
              to="/about"
              className={isActive("/about")}
              onClick={closeMenu}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={isActive("/contact")}
              onClick={closeMenu}
            >
              Contact
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="mobile-auth mt-4">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="btn-smart-dashboard w-100 justify-content-center mb-3"
                    onClick={closeMenu}
                  >
                    Go to Dashboard <FaTachometerAlt className="ms-2" />
                  </Link>
                  <button
                    className="btn-smart-login w-100 bg-danger border-0 justify-content-center text-white"
                    onClick={handleLogout}
                  >
                    Logout <FaSignOutAlt className="ms-2" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-smart-login outline w-100 justify-content-center mb-2"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-smart-login primary w-100 justify-content-center"
                    onClick={closeMenu}
                  >
                    Get Started <FaArrowRight className="ms-2" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
      </div>
    </header>
  );
};

export default Navbar;
