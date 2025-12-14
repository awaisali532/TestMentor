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
} from "react-icons/fa"; // ✅ Added Icons
import "./Navbar.css";

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

  const isActive = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  return (
    <header className={`navbar-floating ${scrolled ? "compact" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          Test<span>Mentor</span>
        </Link>

        <nav className="nav-center desktop-only">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/subjects" className={isActive("/subjects")}>
            Subjects
          </Link>
          <Link to="/about" className={isActive("/about")}>
            About
          </Link>
          <Link to="/contact" className={isActive("/contact")}>
            Contact
          </Link>
        </nav>

        <div className="nav-right desktop-only">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? (
              <FaSun className="icon-sun" />
            ) : (
              <FaMoon className="icon-moon" />
            )}
          </button>

          {user ? (
            <div className="user-profile-pill">
              <FaUserCircle className="me-2 text-warning" />
              <span className="me-2">{user.name.split(" ")[0]}</span>
              <button
                className="icon-btn-logout"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : location.pathname === "/login" ? (
            <Link to="/register" className="btn-smart-login">
              <span>Get Started</span>
              <FaArrowRight className="smart-icon" />
            </Link>
          ) : (
            <Link to="/login" className="btn-smart-login">
              <span>Login</span>
              <FaSignInAlt className="smart-icon" />
            </Link>
          )}
        </div>

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

        <div className={`mobile-drawer ${isOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <FaTimes className="close-icon" onClick={closeMenu} />
          </div>

          <div className="drawer-content">
            <Link to="/" className={isActive("/")} onClick={closeMenu}>
              Home
            </Link>
            <Link
              to="/subjects"
              className={isActive("/subjects")}
              onClick={closeMenu}
            >
              Subjects
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

            <div className="mobile-auth mt-4">
              {user ? (
                <button
                  className="btn-smart-login w-100 bg-danger border-0 justify-content-center"
                  onClick={handleLogout}
                >
                  Logout <FaSignOutAlt className="ms-2" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-smart-login w-100 justify-content-center"
                  onClick={closeMenu}
                >
                  Login <FaSignInAlt className="ms-2" />
                </Link>
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
