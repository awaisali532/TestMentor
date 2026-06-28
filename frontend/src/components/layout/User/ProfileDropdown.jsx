import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBuilding,
  FaCamera,
  FaLock,
  FaSignOutAlt,
  FaCrown,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useUser } from "../../../context/UserContext";

// Avatars
import BoyAvatar from "../../../assets/images/Avatar/boy.jpg";
import GirlAvatar from "../../../assets/images/Avatar/girl.svg";

const ProfileDropdown = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isPremium = user?.planType === "premium" || user?.planType === "paid";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    Swal.fire({
      title: "Leaving already?",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Logout",
      background: "#0f172a",
      color: "#ffffff",
    }).then((result) => {
      if (result.isConfirmed) {
        if (logout) logout();
        navigate("/login", { replace: true });
        window.location.reload();
      }
    });
  };

  // Avatar Image Provider
  const getAvatarSource = () => {
    if (user?.image) return user.image;
    const gender = user?.gender?.toLowerCase() || "";
    if (gender === "female") return GirlAvatar;
    if (gender === "male") return BoyAvatar;
    return null;
  };

  const avatarSrc = getAvatarSource();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none cursor-pointer transition-transform hover:scale-105"
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-extrabold text-main leading-tight">
            {user?.name || "Student"}
          </p>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            {isPremium ? "Premium" : "Free Plan"}
          </p>
        </div>

        {/* ✅ PREMIUM AVATAR WRAPPER (Image Reference Style) */}
        <div className="relative inline-flex items-center justify-center mt-2">
          {/* Crown Centered on Top */}
          {isPremium && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
              <FaCrown className="text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] text-[22px]" />
            </div>
          )}

          {/* Colorful Gradient Ring for Premium, Normal for Free */}
          <div
            className={`rounded-full p-0.75 shadow-md ${isPremium ? "bg-linear-to-tr from-blue-500 via-purple-500 to-yellow-500" : "bg-border"}`}
          >
            <div className="bg-card rounded-full p-0.5">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center font-bold text-lg bg-accent-1 text-white rounded-full">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-56 bg-card border border-border rounded-2xl shadow-xl shadow-accent-1/5 z-50 animate-fade-in overflow-hidden">
          <div className="p-3 border-b border-border sm:hidden">
            <p className="text-sm font-extrabold text-main">
              {user?.name || "Student"}
            </p>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              {isPremium ? "Premium" : "Free Plan"}
            </p>
          </div>

          <div className="p-2 space-y-1">
            <Link
              to="/user/settings?tab=personal"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted hover:text-accent-1 hover:bg-pill-bg rounded-lg transition-colors"
            >
              <FaUser /> Personal Data
            </Link>
            <Link
              to="/user/settings?tab=institute"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted hover:text-accent-1 hover:bg-pill-bg rounded-lg transition-colors"
            >
              <FaBuilding /> Institute Data
            </Link>
            <Link
              to="/user/settings?tab=photo"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted hover:text-accent-1 hover:bg-pill-bg rounded-lg transition-colors"
            >
              <FaCamera /> Update Photo
            </Link>
            <Link
              to="/user/settings?tab=password"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted hover:text-accent-1 hover:bg-pill-bg rounded-lg transition-colors"
            >
              <FaLock /> Change Password
            </Link>
          </div>

          <div className="p-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
