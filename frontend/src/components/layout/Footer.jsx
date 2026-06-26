import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Send } from "lucide-react"; // General icons yahan se
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa"; // Social brands yahan se

const Footer = () => {
  return (
    <footer className="w-full bg-bg-body border-t border-border pt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* 1. Brand & About */}
          <div className="lg:col-span-4">
            <h5 className="text-3xl font-extrabold text-main mb-4">
              Test
              <span className="bg-linear-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
                Mentor
              </span>
            </h5>
            <p className="text-muted leading-relaxed mb-6 max-w-sm">
              Empowering students with smart learning tools, AI-generated
              papers, and real-time analytics to master every exam with
              confidence.
            </p>
            {/* Social Icons (Using React Icons for Brands) */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center size-10 rounded-full bg-pill-bg border border-border text-muted transition-all duration-300 hover:border-transparent hover:-translate-y-1 hover:bg-[#1877f2] hover:text-white hover:shadow-lg hover:shadow-[#1877f2]/30"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center size-10 rounded-full bg-pill-bg border border-border text-muted transition-all duration-300 hover:border-transparent hover:-translate-y-1 hover:bg-[#1da1f2] hover:text-white hover:shadow-lg hover:shadow-[#1da1f2]/30"
              >
                <FaTwitter size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center size-10 rounded-full bg-pill-bg border border-border text-muted transition-all duration-300 hover:border-transparent hover:-translate-y-1 hover:bg-linear-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:shadow-lg hover:shadow-[#dc2743]/30"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="lg:col-span-2">
            <h6 className="text-lg font-bold text-main mb-6 relative inline-block after:content-[''] after:absolute after:w-8 after:h-1 after:bg-linear-to-r after:from-accent-1 after:to-accent-2 after:-bottom-2 after:left-0 after:rounded-full">
              Quick Links
            </h6>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/subjects"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  Subjects
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Resources */}
          <div className="lg:col-span-2">
            <h6 className="text-lg font-bold text-main mb-6 relative inline-block after:content-[''] after:absolute after:w-8 after:h-1 after:bg-linear-to-r after:from-accent-1 after:to-accent-2 after:-bottom-2 after:left-0 after:rounded-full">
              Resources
            </h6>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/faq"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-muted hover:text-accent-1 hover:translate-x-1 transition-all duration-300"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter & Contact */}
          <div className="lg:col-span-4">
            <h6 className="text-lg font-bold text-main mb-6 relative inline-block after:content-[''] after:absolute after:w-8 after:h-1 after:bg-linear-to-r after:from-accent-1 after:to-accent-2 after:-bottom-2 after:left-0 after:rounded-full">
              Stay Updated
            </h6>
            <p className="text-muted mb-4">
              Subscribe to get the latest updates and study tips.
            </p>

            {/* Newsletter Input */}
            <div className="relative w-full mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full py-3 pl-5 pr-14 rounded-full bg-pill-bg border border-border text-main outline-none focus:border-accent-1 transition-colors duration-300"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 w-10 flex items-center justify-center rounded-full bg-linear-to-r from-accent-1 to-accent-2 text-white hover:scale-105 transition-transform duration-300 shadow-md">
                <Send size={16} className="-ml-0.5" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-3 text-muted">
                <Mail size={18} className="text-accent-1" />{" "}
                support@testmentor.com
              </p>
              <p className="flex items-center gap-3 text-muted">
                <Phone size={18} className="text-accent-1" /> +92 300 1234567
              </p>
            </div>
          </div>
        </div>

        {/* --- FOOTER BOTTOM --- */}
        <div className="mt-16 py-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-main">TestMentor</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
