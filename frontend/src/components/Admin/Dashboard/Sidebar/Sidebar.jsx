import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
// Using specific icons to match the image exactly
import { MdSpaceDashboard } from "react-icons/md"; // Dashboard Grid
import {
  FaFolder,
  FaBook,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaHistory,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useUser();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <div className="sidebar">
      {/* 1. Brand Logo */}
      <div className="sidebar-header">
        <h3>
          QuestBank{" "}
          <span style={{ fontWeight: 300, fontSize: "14px", opacity: 0.7 }}>
            Admin
          </span>
        </h3>
      </div>

      {/* 2. Menu Items */}
      <ul className="sidebar-menu">
        <li>
          <Link
            to="/admin/dashboard"
            className={`menu-link ${isActive("/admin/dashboard")}`}
          >
            <MdSpaceDashboard className="menu-icon" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/question-bank"
            className={`menu-link ${isActive("/admin/question-bank")}`}
          >
            <FaFolder className="menu-icon" />
            <span>Question Bank</span>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/subjects"
            className={`menu-link ${isActive("/admin/subjects")}`}
          >
            <FaBook className="menu-icon" />
            <span>Manage Subjects</span>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/users"
            className={`menu-link ${isActive("/admin/users")}`} // This handles the blue active color
          >
            <FaUser className="menu-icon" />{" "}
            {/* Or FaUsers depending on your import */}
            <span>User Management</span>
          </Link>
        </li>
        <li>
          <Link
            to="/admin/recent-activity"
            className={`menu-link ${isActive("/admin/recent-activity")}`}
          >
            <FaHistory className="menu-icon" />
            <span>Recent Activity</span>
          </Link>
        </li>
        <li>
          <a href="#" className="menu-link">
            <FaCog className="menu-icon" />
            <span>Settings</span>
          </a>
        </li>
      </ul>

      {/* 3. Logout (Bottom) */}
      <div className="sidebar-footer">
        <button onClick={logout} className="btn btn-danger">
          <FaSignOutAlt className="menu-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
