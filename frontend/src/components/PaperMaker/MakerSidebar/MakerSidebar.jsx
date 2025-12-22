import React, { useState, useEffect } from "react";
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
import "./MakerSidebar.css";

const MakerSidebar = ({
  paperData,
  onOpenMenu,
  isMenuOpen,
  isCollapsed,
  toggleCollapse,
}) => {
  const navigate = useNavigate();
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

  const handleNavigation = (tab) => {
    // ✅ DISABLE CLICK IF MENU IS OPEN (Safety Check)
    if (isMenuOpen && tab !== "menu") return;

    setActiveTab(tab);
    if (tab === "menu") {
      onOpenMenu();
    }
  };

  // ✅ CONFIRM EXIT LOGIC (Go back to Mode Selector)
  const confirmExit = () => {
    // Hum 'keepData: true' bhej rahe hain taake Wizard data reset na kare
    navigate("/user/generate-paper", { state: { keepData: true } });
  };

  const getProfileImage = () => {
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    return `${BASE_URL}${user.profileImage}`;
  };
  const profilePic = getProfileImage();

  return (
    <div className={`pm-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Collapse Button - Isay disable nahi karna */}
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

      {/* ✅ DISABLE MENU CONTAINER IF MENU IS OPEN */}
      {/* Hum 'pointer-events-none' class lagayenge */}
      <div className={`pm-menu-list ${isMenuOpen ? "disabled-sidebar" : ""}`}>
        <button
          className={`pm-item ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => handleNavigation("menu")} // Isay click krne dena ha taake menu khul sake
          title={isCollapsed ? "Question Menu" : ""}
        >
          <div className="pm-icon-box">
            <FaBars />
          </div>
          {!isCollapsed && <span>Question's Menu</span>}
        </button>

        {/* Baki Buttons */}
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

        <button
          className={`pm-item ${activeTab === "save" ? "active" : ""}`}
          onClick={() => handleNavigation("save")}
          title="Save Paper"
        >
          <div className="pm-icon-box text-green">
            <FaSave />
          </div>
          {!isCollapsed && <span>Save Paper</span>}
        </button>

        <div className="pm-spacer"></div>

        {/* Print Buttons */}
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

        {/* Cancel - Isay disable nahi karna chahiye taake user wapis ja sake, 
            Lekin agar aap chahte hain ke menu khula ho to cancel na ho, to isay bhi disable kr dein.
            Filhal main isay disable kar raha hoon jesa aap ne kaha. */}
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
        title="Go Back?"
        message="Your progress will be saved, and you will return to Mode Selection."
        confirmText="Yes, Go Back"
        cancelText="Stay Here"
        isDanger={false} // Blue button
      />
    </div>
  );
};

export default MakerSidebar;
