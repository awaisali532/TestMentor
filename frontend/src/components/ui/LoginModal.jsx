import React from "react";
import { FaLock, FaSignInAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginModal = ({
  isOpen,
  onClose,
  message = "You need to login to continue.",
}) => {
  const navigate = useNavigate();

  // Agar state false hai toh kuch bhi render nahi hoga
  if (!isOpen) return null;

  // Background par click karne se modal band karne ki logic
  const handleOverlayClick = (e) => {
    if (e.target.id === "login-modal-overlay") {
      onClose();
    }
  };

  return (
    <div
      id="login-modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9999 flex justify-center items-center p-4 transition-opacity duration-300"
    >
      <div className="bg-card w-full max-w-sm p-8 rounded-3xl text-center relative shadow-2xl border border-border scale-100 transition-transform duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
        >
          <FaTimes size={20} />
        </button>

        {/* Icon */}
        <div className="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-red-500/20">
          <FaLock />
        </div>

        {/* Text */}
        <h4 className="text-xl font-bold text-main mb-2">Login Required</h4>
        <p className="text-sm text-muted mb-6 leading-relaxed">{message}</p>

        {/* Action Button */}
        <button
          onClick={() => {
            onClose(); // Pehle modal band karo
            navigate("/login"); // Phir login page par bhejo
          }}
          className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white border-none py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-1/40 cursor-pointer"
        >
          <FaSignInAlt /> Login Now
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
