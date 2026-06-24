import React from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import "./Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
  FaPaperPlane,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-section">
      {/* Decorative Top Border */}
      <div className="footer-top-border"></div>

      <div className="container">
        <div className="row gy-5">
          {/* 1. Brand & About */}
          <div className="col-lg-4 col-md-6">
            <h5 className="footer-brand">
              Test<span>Mentor</span>
            </h5>
            <p className="footer-desc">
              Empowering students with smart learning tools, AI-generated
              papers, and real-time analytics to master every exam with
              confidence.
            </p>
            <div className="social-links">
              {/* External Links use <a> tags safely */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon fb"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon tw"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon insta"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* 2. Quick Links (Updated to use <Link>) */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="footer-heading">Quick Links</h6>
            <ul className="footer-links">
              {/* ✅ Replaced <a> with <Link> */}
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/subjects">Subjects</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* 3. Resources (Updated to use <Link>) */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="footer-heading">Resources</h6>
            <ul className="footer-links">
              {/* ✅ Replaced <a> with <Link> */}
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/support">Support</Link>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter & Contact */}
          <div className="col-lg-4 col-md-6">
            <h6 className="footer-heading">Stay Updated</h6>
            <p className="footer-desc mb-3">
              Subscribe to get the latest updates and study tips.
            </p>

            <div className="newsletter-box">
              <input type="email" placeholder="Enter your email" />
              <button>
                <FaPaperPlane />
              </button>
            </div>

            <div className="contact-info mt-4">
              <p>
                <FaEnvelope className="icon" /> support@testmentor.com
              </p>
              <p>
                <FaPhoneAlt className="icon" /> +92 300 1234567
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="mb-0">
            © {new Date().getFullYear()}{" "}
            <span className="text-highlight">TestMentor</span>. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
