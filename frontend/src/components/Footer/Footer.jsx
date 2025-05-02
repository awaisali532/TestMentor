import React from "react";
import "./Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer text-white py-4 mt-5">
      <div className="container">
        <div className="row gy-4 text-center text-md-start">
          {/* Site Logo / Description */}
          <div className="col-12 col-md-3">
            <h5 className="footer-brand">TestMentor</h5>
            <p className="small">
              Empowering Students with Smart Learning Tools.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-12 col-md-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled small">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-3">
            <h6 className="fw-bold">Contact</h6>
            <p className="small mb-1">
              <FaEnvelope className="me-2" /> support@testmentor.com
            </p>
          </div>

          {/* Social Links */}
          <div className="col-12 col-md-3">
            <h6 className="fw-bold">Follow Us</h6>
            <div className="d-flex justify-content-center justify-content-md-start gap-3 social-icons">
              <a href="#">
                <FaFacebookF />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-light mt-4" />
        <div className="text-center small mt-2">
          © {new Date().getFullYear()} TestMentor. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
