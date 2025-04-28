import React, { useState, useEffect, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi"; // Hamburger icon from react-icons
import { AiOutlineClose } from "react-icons/ai"; // Close (X) icon from react-icons
import { Link } from "react-router-dom"; // If you plan to use React Router for navigation
import "./Navbar.css"; // SCSS file link

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Toggle state for mobile menu
  const menuRef = useRef(null); // Create a reference for the menu container
  const hamburgerRef = useRef(null); // Create a reference for the hamburger icon

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the menu and hamburger icon
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Attach the click event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="custom-navbar">
      <div className="container">
        {/* Left - Logo */}
        <Link to={"/"} className="logo">
          TestMentor
        </Link>

        {/* Right - Menu + Login Button */}
        <div
          className="hamburger-icon"
          ref={hamburgerRef} // Reference to the hamburger icon
          onClick={toggleMenu}
        >
          {isOpen ? <AiOutlineClose /> : <GiHamburgerMenu />}
        </div>

        <div
          ref={menuRef}
          className={`menu-items-container ${isOpen ? "open" : ""}`}
        >
          <ul className="menu-items">
            <li>
              <Link to={"/home"}>Home</Link>
            </li>
            <li>
              <Link to={"/subjects"}>Subjects</Link>
            </li>
            <li>
              <Link to={"/about"}>About</Link>
            </li>
            <li>
              <Link to={"/contact"}>Contact</Link>
            </li>
          </ul>
          <Link className="button-primary ms-3" to={"/login"}>
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
