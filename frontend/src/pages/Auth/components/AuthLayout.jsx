import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Reveal from "../../../components/ui/Reveal";

const AuthLayout = ({
  children,
  imageSrc,
  title,
  subtitle,
  linkText,
  linkTo,
  linkMessage,
}) => {
  return (
    <div className="min-h-screen bg-bg-body pb-12 px-4 flex items-center justify-center transition-colors duration-300 relative">
      {/* ✅ Minimal Back to Home Button (Replaces Navbar) */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-10 flex items-center gap-2 text-muted hover:text-main transition-colors font-bold z-50 bg-card/50 backdrop-blur-md px-4 py-2 rounded-full border border-border hover:border-accent-1 hover:shadow-md"
      >
        <FaArrowLeft className="text-sm" /> Home
      </Link>

      <Reveal direction="up" className="w-full max-w-5xl mt-6">
        <div className="flex flex-col lg:flex-row bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-accent-1/5">
          {/* LEFT PANEL */}
          <div className="lg:w-2/5 bg-linear-to-br from-accent-1 to-accent-2 p-10 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

            <img
              src={imageSrc}
              alt="Auth"
              className="w-3/4 max-w-62.5 mb-8 drop-shadow-2xl relative z-10"
              style={{ animation: "float 4s ease-in-out infinite" }}
            />

            <h2 className="text-3xl font-extrabold mb-3 relative z-10">
              {title}
            </h2>
            <p className="text-white/80 font-medium mb-8 max-w-xs relative z-10">
              {subtitle}
            </p>

            <div className="mt-auto pt-8 w-full border-t border-white/20 relative z-10">
              <p className="text-sm text-white/90 mb-3">{linkMessage}</p>
              <Link
                to={linkTo}
                className="inline-block px-8 py-2.5 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-accent-1 transition-all duration-300 shadow-lg"
              >
                {linkText}
              </Link>
            </div>

            <style>{`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }`}</style>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:w-3/5 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-card">
            {children}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default AuthLayout;
