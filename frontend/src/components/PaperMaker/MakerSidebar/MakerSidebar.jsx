import React, { useState, useEffect } from "react";
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
import "./MakerSidebar.css";

const MakerSidebar = ({
  paperData,
  onOpenMenu,
  isMenuOpen,
  isCollapsed,
  toggleCollapse,
  onCancel, // ✅ Receive Cancel Handler
  onSave, // ✅ Receive Save Handler
}) => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("menu");
  const [showExitModal, setShowExitModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Auto-Open Logic
  useEffect(() => {
    if (activeTab === "menu") {
      onOpenMenu();
    }
  }, []);

  // Sync Logic
  useEffect(() => {
    if (!isMenuOpen && activeTab === "menu") {
      setActiveTab("");
    }
  }, [isMenuOpen, activeTab]);

  // ✅ FIXED NAVIGATION HANDLER
  const handleNavigation = (tab) => {
    // 1. Agar Menu khula hai to baqi buttons disable rakho (optional UX preference)
    if (isMenuOpen && tab !== "menu") return;

    setActiveTab(tab);

    // 2. Specific Actions based on Tab
    if (tab === "menu") {
      onOpenMenu();
    }

    // ✅ SAVE BUTTON CLICK FIX
    if (tab === "save") {
      if (onSave) onSave(); // Call the Parent Function
    }
  };

  // Confirm Exit Logic
  const confirmExit = () => {
    if (onCancel) onCancel();
    setShowExitModal(false);
  };

  return (
    <div className={`pm-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Collapse Button */}
      <button className="pm-collapse-btn" onClick={toggleCollapse}>
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* User Profile */}
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
            <h3 className="pm-user-name">{user?.name || "User"}</h3>
            {user?.isPremium ? (
              <div className="pm-premium-badge">
                <FaCrown /> PREMIUM
              </div>
            ) : (
              <span className="pm-user-role">{user?.role || "Admin"}</span>
            )}
          </div>
        )}
      </div>

      <div className="pm-divider"></div>

      {/* Menu List */}
      <div className={`pm-menu-list ${isMenuOpen ? "disabled-sidebar" : ""}`}>
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
          title="Manual Editing"
        >
          <div className="pm-icon-box">
            <FaEdit />
          </div>
          {!isCollapsed && <span>Manual Editing</span>}
        </button>

        {/* ✅ SAVE BUTTON */}
        <button
          className={`pm-item ${activeTab === "save" ? "active" : ""}`}
          onClick={() => handleNavigation("save")} // Ab ye onSave call karega
          title="Save Paper"
        >
          <div className="pm-icon-box text-green">
            <FaSave />
          </div>
          {!isCollapsed && <span>Save Paper</span>}
        </button>

        <div className="pm-spacer"></div>

        {/* Print Buttons (Future) */}
        <button
          className={`pm-item ${activeTab === "print_single" ? "active" : ""}`}
          onClick={() => handleNavigation("print_single")}
        >
          <div className="pm-icon-box">
            <FaPrint />
          </div>
          {!isCollapsed && <span>Print Single</span>}
        </button>
        <button
          className={`pm-item ${activeTab === "print_dv" ? "active" : ""}`}
          onClick={() => handleNavigation("print_dv")}
        >
          <div className="pm-icon-box">
            <FaColumns />
          </div>
          {!isCollapsed && <span>Print Double (V)</span>}
        </button>
        <button
          className={`pm-item ${activeTab === "print_dh" ? "active" : ""}`}
          onClick={() => handleNavigation("print_dh")}
        >
          <div className="pm-icon-box">
            <FaBookOpen />
          </div>
          {!isCollapsed && <span>Print Double (H)</span>}
        </button>

        <div className="pm-spacer"></div>

        {/* Cancel Button */}
        <button
          className="pm-item danger"
          onClick={() => setShowExitModal(true)}
          title="Cancel Paper"
        >
          <div className="pm-icon-box text-red">
            <FaTimes />
          </div>
          {!isCollapsed && <span>Cancel Paper</span>}
        </button>
      </div>

      <div className="pm-sidebar-footer">
        <button className="pm-theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? (
            <FaSun className="icon-sun" />
          ) : (
            <FaMoon className="icon-moon" />
          )}
          {!isCollapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={confirmExit}
        title="Discard Paper?"
        message="All progress will be lost. You will return to Dashboard."
        confirmText="Discard & Exit"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default MakerSidebar;
