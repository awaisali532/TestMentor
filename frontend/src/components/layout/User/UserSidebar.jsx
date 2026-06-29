import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaFileAlt,
  FaBookOpen,
  FaCrown,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaHeadset,
  FaUniversity,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";

const UserSidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const { user } = useUser();
  const isPremium = user?.planType === "premium" || user?.planType === "paid";

  const navLinks = [
    { name: "Dashboard", path: "/user/dashboard", icon: FaHome },
    { name: "Past Papers", path: "/user/past-papers", icon: FaFileAlt },
    ...(user?.canAccessPracticeMode
      ? [{ name: "Study Mode", path: "/user/practice", icon: FaBookOpen }]
      : []),
  ];

  return (
    <aside
      className={`fixed z-40 bg-card border border-border shadow-sm flex flex-col transition-all duration-300 ease-in-out
      lg:relative lg:translate-x-0 rounded-2xl my-4 ml-4 h-[calc(100vh-32px)] 
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      ${isCollapsed ? "w-20" : "w-64"}
    `}
    >
      {/* COLLAPSE BUTTON */}
      <button
        onClick={toggleCollapse}
        className="hidden lg:flex absolute -right-3 top-10 w-7 h-7 bg-card border border-border rounded-full items-center justify-center text-muted hover:text-accent-1 z-50 cursor-pointer shadow-md hover:scale-110 transition-transform"
      >
        {isCollapsed ? (
          <FaChevronRight size={12} />
        ) : (
          <FaChevronLeft size={12} />
        )}
      </button>

      {/* 1. Top: Main Branding / Logo */}
      <div className="h-16 flex items-center justify-center px-4 shrink-0 border-b border-border">
        <h3 className="text-xl font-extrabold text-main truncate transition-all duration-300">
          {isCollapsed ? "T" : "Test"}
          <span className="text-accent-1">{isCollapsed ? "M" : "Mentor"}</span>
        </h3>
        <button
          className="lg:hidden absolute right-4 text-muted hover:text-main cursor-pointer"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* ✅ 2. Workspace / Institute Badge */}
      <div
        className={`border-b border-border transition-all duration-300 flex justify-center ${isCollapsed ? "py-4" : "p-4"}`}
      >
        <div
          className={`flex flex-col items-center justify-center w-full transition-all duration-300 ${
            isCollapsed
              ? "bg-transparent border-transparent" // ✅ Collapse hone par box hide
              : "bg-pill-bg border border-border rounded-2xl p-4 py-5 shadow-sm" // Open hone par box show
          }`}
        >
          {/* Institute Logo */}
          <div
            className={`rounded-full bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all duration-300 ${
              isCollapsed ? "w-16 h-16" : "w-26 h-26 mb-3" // ✅ Standard Tailwind sizing
            }`}
          >
            {user?.institute?.logo ? (
              <img
                src={user.institute.logo}
                alt="Institute"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <FaUniversity
                className="text-accent-1 opacity-80"
                size={isCollapsed ? 18 : 32}
              />
            )}
          </div>

          {/* Institute Name */}
          {!isCollapsed && (
            <div className="text-center w-full px-1">
              <p
                className="text-sm font-extrabold text-main "
                title={user?.institute?.name || "My Institute"}
              >
                {user?.institute?.name || "My Institute"}
              </p>
              <p className="text-[9px] text-muted uppercase tracking-wider font-semibold mt-1">
                Workspace
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Middle: Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar overflow-x-hidden">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={onClose}
            title={isCollapsed ? link.name : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl font-semibold transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-4"} ${
                isActive
                  ? "bg-accent-1/10 text-accent-1 shadow-sm border border-accent-1/20"
                  : "text-muted hover:bg-pill-bg hover:text-main"
              }`
            }
          >
            <link.icon size={isCollapsed ? 22 : 18} className="shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap">{link.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 4. Bottom: Upgrade Banner OR Premium Space */}
      <div className="p-4 shrink-0 overflow-hidden">
        {!isPremium ? (
          <div
            className={`relative bg-card border border-border rounded-2xl text-center shadow-lg transition-all duration-300 group overflow-hidden ${isCollapsed ? "p-3" : "p-5"}`}
          >
            <div className="absolute inset-0 bg-linear-to-br from-yellow-400/10 to-amber-600/10 opacity-50"></div>
            <FaCrown
              className={`mx-auto text-yellow-400 drop-shadow-md animate-pulse ${isCollapsed ? "text-2xl mb-0" : "text-3xl mb-2"}`}
            />
            {!isCollapsed && (
              <>
                <h4 className="font-bold mb-1 text-main">Go Premium</h4>
                <p className="text-[10px] text-muted mb-3 uppercase tracking-wider">
                  Unlock all features
                </p>
                <button className="relative w-full bg-linear-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 cursor-pointer overflow-hidden group/btn">
                  <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:-translate-y-10 transition-transform duration-300">
                    Upgrade Now
                  </span>
                  <span className="absolute inset-0 z-10 flex items-center justify-center translate-y-10 group-hover/btn:translate-y-0 transition-transform duration-300">
                    <FaCrown size={18} />
                  </span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center bg-pill-bg border border-border rounded-2xl transition-all duration-300 cursor-pointer hover:bg-card hover:border-accent-1/50 ${isCollapsed ? "p-3" : "p-4"}`}
            title="Premium Support"
          >
            <FaHeadset className="text-xl text-accent-1 drop-shadow-sm" />
            {!isCollapsed && (
              <span className="text-xs font-bold text-main mt-2">
                Premium Support
              </span>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default UserSidebar;
