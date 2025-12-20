import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaEdit,
  FaSave,
  FaPrint,
  FaColumns,
  FaBookOpen,
  FaTimes,
  FaSun,
  FaMoon,
  FaUserGraduate,
  FaCrown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../context/ThemeContext";
import ConfirmationModal from "../../common/ConfirmationModal/ConfirmationModal";
// ❌ QuestionMenu import hata dein
import "./MakerSidebar.css";

// ✅ Receive onOpenMenu Prop
const MakerSidebar = ({ paperData, onOpenMenu }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("menu");
  const [showExitModal, setShowExitModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ❌ Remove local isMenuOpen state

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === "menu") {
      onOpenMenu(); // ✅ Call Parent Function
    }
  };

  const confirmExit = () => navigate("/user/dashboard");
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getProfileImage = () => {
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    return `${BASE_URL}${user.profileImage}`;
  };

  const profilePic = getProfileImage();

  return (
    <div className={`pm-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="pm-collapse-btn" onClick={toggleCollapse}>
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* USER PROFILE */}
      <div className="pm-profile-section">
        <div className={`pm-avatar-circle ${isCollapsed ? "small" : ""}`}>
          {user?.image ? (
            <img
              src={user.image}
              alt="Profile"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <FaUserGraduate />
          )}
        </div>

        {!isCollapsed && (
          <div className="pm-user-details fade-in">
            <h3 className="pm-user-name">{user?.name || "User Name"}</h3>
            {user?.isPremium ? (
              <div className="pm-premium-badge">
                <FaCrown className="icon-crown" />
                <span>PREMIUM USER</span>
              </div>
            ) : (
              <span className="pm-user-role">
                {user?.role || "Administrator"}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pm-divider"></div>

      {/* MENU ITEMS */}
      <div className="pm-menu-list">
        <button
          className={`pm-item ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => handleNavigation("menu")}
          title={isCollapsed ? "Question Menu" : ""}
        >
          <div className="pm-icon-box">
            <FaBars />
          </div>
          {!isCollapsed && <span>Question's Menu</span>}
        </button>

        <button
          className={`pm-item ${activeTab === "edit" ? "active" : ""}`}
          onClick={() => handleNavigation("edit")}
          title={isCollapsed ? "Manual Editing" : ""}
        >
          <div className="pm-icon-box">
            <FaEdit />
          </div>
          {!isCollapsed && <span>Manual Editing</span>}
        </button>

        <button
          className={`pm-item ${activeTab === "save" ? "active" : ""}`}
          onClick={() => handleNavigation("save")}
          title={isCollapsed ? "Save Paper" : ""}
        >
          <div className="pm-icon-box text-green">
            <FaSave />
          </div>
          {!isCollapsed && <span>Save Paper</span>}
        </button>

        <div className="pm-spacer"></div>

        <button
          className={`pm-item ${activeTab === "print_single" ? "active" : ""}`}
          onClick={() => handleNavigation("print_single")}
          title={isCollapsed ? "Print Single" : ""}
        >
          <div className="pm-icon-box">
            <FaPrint />
          </div>
          {!isCollapsed && <span>Print Single</span>}
        </button>

        <button
          className={`pm-item ${activeTab === "print_dv" ? "active" : ""}`}
          onClick={() => handleNavigation("print_dv")}
          title={isCollapsed ? "Print Double (V)" : ""}
        >
          <div className="pm-icon-box">
            <FaColumns />
          </div>
          {!isCollapsed && <span>Print Double (Vertical)</span>}
        </button>

        <button
          className={`pm-item ${activeTab === "print_dh" ? "active" : ""}`}
          onClick={() => handleNavigation("print_dh")}
          title={isCollapsed ? "Print Double (H)" : ""}
        >
          <div className="pm-icon-box">
            <FaBookOpen />
          </div>
          {!isCollapsed && <span>Print Double (Horizontal)</span>}
        </button>

        <div className="pm-spacer"></div>

        <button
          className="pm-item danger"
          onClick={() => setShowExitModal(true)}
          title={isCollapsed ? "Cancel Paper" : ""}
        >
          <div className="pm-icon-box text-red">
            <FaTimes />
          </div>
          {!isCollapsed && <span>Cancel Paper</span>}
        </button>
      </div>

      {/* FOOTER */}
      <div className="pm-sidebar-footer">
        <button
          className="pm-theme-toggle"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <FaSun className="icon-sun" />
          ) : (
            <FaMoon className="icon-moon" />
          )}
          {!isCollapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={confirmExit}
        title="Cancel Paper?"
        message="All progress will be lost. Are you sure?"
        confirmText="Yes, Cancel"
        cancelText="Continue"
        isDanger={true}
      />

      {/* ❌ REMOVED: Question Menu from here */}
    </div>
  );
};

export default MakerSidebar;
