import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  // ✅ Helper to check if link is active
  const isActive = (path) => {
    return location.pathname === path ? "active-link" : "";
  };

  return (
    <nav className="custom-navbar">
      <div className="container">
        <Link to={"/"} className="logo" onClick={closeMenu}>
          TestMentor
        </Link>

        {/* Hamburger Icon */}
        <div className="hamburger-icon" onClick={toggleMenu}>
          {isOpen ? <AiOutlineClose /> : <GiHamburgerMenu />}
        </div>

        {/* Menu Items */}
        <div className={`menu-items-container ${isOpen ? "open" : ""}`}>
          <ul className="menu-items">
            <li>
              <Link to={"/"} className={isActive("/")} onClick={closeMenu}>
                Home
              </Link>
            </li>

            {/* ✅ SUBJECTS LINK ADDED HERE */}
            <li>
              <Link
                to={"/subjects"}
                className={isActive("/subjects")}
                onClick={closeMenu}
              >
                Subjects
              </Link>
            </li>

            <li>
              <Link
                to={"/about"}
                className={isActive("/about")}
                onClick={closeMenu}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to={"/contact"}
                className={isActive("/contact")}
                onClick={closeMenu}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Auth Buttons Logic */}
          {user ? (
            <div className="d-flex align-items-center gap-3 ms-3 mobile-auth-section">
              <span className="user-greeting text-white small d-none d-lg-block">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                className="button-primary bg-danger border-0"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : location.pathname === "/login" ? (
            <Link
              className="button-primary ms-3"
              to={"/register"}
              onClick={closeMenu}
            >
              Register
            </Link>
          ) : (
            <Link
              className="button-primary ms-3"
              to={"/login"}
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
