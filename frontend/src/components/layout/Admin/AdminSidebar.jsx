import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFolderOpen,
  FaBookOpen,
  FaLayerGroup,
  FaUsers,
  FaHistory,
  FaBell,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCrown,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";

const AdminSidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const { user } = useUser();

  // 7 Core Admin Management Links (Profile & Site Settings live in Topbar Dropdown)
  const navLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FaTachometerAlt },
    { name: "Question Bank", path: "/admin/question-bank", icon: FaFolderOpen },
    { name: "Manage Subjects", path: "/admin/subjects", icon: FaBookOpen },
    { name: "Paper Patterns", path: "/admin/paper-patterns", icon: FaLayerGroup },
    { name: "User Management", path: "/admin/users", icon: FaUsers },
    { name: "Recent Activity", path: "/admin/recent-activity", icon: FaHistory },
    { name: "Notifications", path: "/admin/notifications", icon: FaBell },
  ];

  return (
    <aside
      className={`fixed top-3 left-3 bottom-3 z-50 bg-card border border-border shadow-2xl flex flex-col transition-all duration-300 ease-in-out
      rounded-2xl h-[calc(100dvh-24px)] max-h-[calc(100dvh-24px)]
      lg:relative lg:top-0 lg:left-0 lg:z-40 lg:my-4 lg:ml-4 lg:h-[calc(100vh-32px)] lg:max-h-[calc(100vh-32px)] lg:shadow-sm lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)]"}
      ${isCollapsed ? "w-20" : "w-64"}
    `}
    >
      {/* COLLAPSE BUTTON FOR DESKTOP */}
      <button
        onClick={toggleCollapse}
        className="hidden lg:flex absolute -right-3 top-10 w-7 h-7 bg-card border border-border rounded-full items-center justify-center text-muted hover:text-accent-1 z-50 cursor-pointer shadow-md hover:scale-110 transition-transform"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
      </button>

      {/* 1. CLEAN BRAND HEADER (No extra badge box) */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-border">
        <div className="flex items-center gap-2 overflow-hidden">
          {!isCollapsed ? (
            <div className="flex flex-col truncate">
              <h3 className="text-lg font-extrabold text-main truncate tracking-tight leading-tight">
                Test<span className="text-accent-1">Mentor</span>
              </h3>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
          ) : (
            <div className="size-9 rounded-xl bg-accent-1/10 border border-accent-1/20 text-accent-1 flex items-center justify-center font-extrabold text-sm shadow-xs mx-auto">
              TM
            </div>
          )}
        </div>
        <button
          className="lg:hidden text-muted hover:text-main cursor-pointer p-1.5"
          onClick={onClose}
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* 2. NAVIGATION LINKS (Scrollable container) */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={onClose}
            title={isCollapsed ? link.name : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isCollapsed ? "justify-center px-0" : "px-3.5"
              } ${
                isActive
                  ? "bg-accent-1/10 text-accent-1 shadow-xs border border-accent-1/20 font-bold"
                  : "text-muted hover:bg-pill-bg hover:text-main"
              }`
            }
          >
            <link.icon size={isCollapsed ? 20 : 17} className="shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap truncate">{link.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. FOOTER INFO */}
      <div className="p-3 shrink-0 border-t border-border bg-card rounded-b-2xl">
        <div
          className={`flex items-center gap-3 bg-pill-bg border border-border rounded-xl p-2.5 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="size-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <FaCrown size={14} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-main truncate">
                {user?.name || "Admin User"}
              </span>
              <span className="text-[10px] text-muted truncate">
                {user?.isSuperAdmin ? "Super Admin" : "Administrator"}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
