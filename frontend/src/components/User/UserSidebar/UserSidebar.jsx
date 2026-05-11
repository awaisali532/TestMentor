import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import {
  FaHome,
  FaFileAlt,
  FaUserCog,
  FaCrown,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
  FaBookOpen, // ✅ NEW: Icon for Practice Mode
} from "react-icons/fa";
import "./UserSidebar.css";

// ✅ Import Upgrade Modal
import UpgradeModal from "../../../components/common/UpgradeModal/UpgradeModal";

// ✅ IMPORT AVATARS (Ensure Path is Correct)
import BoyAvatar from "../../../assets/imeages/Avatar/boy.jpg";
import GirlAvatar from "../../../assets/imeages/Avatar/girl.svg";

const UserSidebar = ({
  isDarkMode,
  toggleTheme,
  isCollapsed,
  toggleCollapse,
  closeMobileMenu,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  // ✅ State for Modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isActive = (path) => (location.pathname === path ? "usr-active" : "");

  const formatDate = (dateString) => {
    if (!dateString) return "Lifetime";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogoutClick = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    if (logout) logout();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const userName = user?.name || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  // ✅ CHECK: Is User Premium?
  const isPremium = user?.planType === "premium" || user?.planType === "paid";

  // ✅ AVATAR RENDER LOGIC
  const renderAvatar = () => {
    // 1. Agar User ne Image Upload ki hai
    if (user?.image) {
      return (
        <img
          src={user.image}
          alt="Profile"
          className="usr-avatar"
          style={{ objectFit: "cover" }}
        />
      );
    }

    // 2. Agar Image nahi hai -> Check Gender
    const gender = user?.gender ? user.gender.trim().toLowerCase() : "";

    if (gender === "male") {
      return <img src={BoyAvatar} alt="Boy" className="usr-avatar" />;
    } else if (gender === "female") {
      return <img src={GirlAvatar} alt="Girl" className="usr-avatar" />;
    }

    // 3. Fallback: First Letter (Agar Gender bhi nahi hai)
    return <div className="usr-avatar">{userInitial}</div>;
  };

  return (
    <>
      <div
        className={`usr-sidebar-container ${
          isCollapsed ? "collapsed-mode" : ""
        }`}
      >
        {/* Toggle Button */}
        <button className="usr-collapse-btn" onClick={toggleCollapse}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/* Brand */}
        <div className="usr-brand">
          {isCollapsed ? (
            <h3 className="brand-short">TM</h3>
          ) : (
            <h3>
              Test<span className="brand-accent">Mentor</span>
            </h3>
          )}
        </div>

        {/* Profile Section */}
        <div className="usr-profile-card">
          <div className="usr-avatar-container">
            {/* ✅ CALL RENDER FUNCTION HERE */}
            {renderAvatar()}

            {!isCollapsed && <div className="online-dot"></div>}
          </div>

          {!isCollapsed && (
            <div className="usr-info fade-in">
              <h5 className="usr-name">{userName}</h5>

              {/* ✅ DYNAMIC BADGE FROM BACKEND */}
              {isPremium ? (
                <>
                  <span className="usr-badge usr-badge-paid">
                    <FaCrown size={10} /> Premium Member
                  </span>
                  {user?.subscription?.validUntil && (
                    <span className="usr-validity">
                      Exp: {formatDate(user.subscription.validUntil)}
                    </span>
                  )}
                </>
              ) : (
                <span className="usr-badge usr-badge-free">Free Plan</span>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="usr-nav-menu">
          <Link
            to="/user/dashboard"
            className={`usr-nav-link ${isActive("/user/dashboard")}`}
            onClick={closeMobileMenu}
          >
            <FaHome size={20} /> {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link
            to="/user/past-papers"
            className={`usr-nav-link ${isActive("/user/past-papers")}`}
            onClick={closeMobileMenu}
          >
            <FaFileAlt size={20} /> {!isCollapsed && <span>Past Papers</span>}
          </Link>

          {/* ✅ NEW: PRACTICE MODE LINK (Conditional Render) */}
          {user?.canAccessPracticeMode && (
            <Link
              to="/user/practice"
              className={`usr-nav-link ${isActive("/user/practice")}`}
              onClick={closeMobileMenu}
            >
              <FaBookOpen size={20} /> {!isCollapsed && <span>Study Mode</span>}
            </Link>
          )}

          <Link
            to="/user/settings"
            className={`usr-nav-link ${isActive("/user/settings")}`}
            onClick={closeMobileMenu}
          >
            <FaUserCog size={20} /> {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        {/* Footer */}
        <div className="usr-sidebar-footer">
          {/* ✅ UPGRADE BUTTON (Only if Free & Not Collapsed) */}
          {!isPremium && !isCollapsed && (
            <button
              className="usr-btn-upgrade fade-in"
              onClick={() => setShowUpgradeModal(true)} // Opens Modal
            >
              <FaCrown /> Upgrade to Premium
            </button>
          )}

          <div
            className={`usr-footer-actions ${isCollapsed ? "col-mode" : ""}`}
          >
            <button
              className="usr-icon-btn"
              onClick={toggleTheme}
              title="Theme"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="usr-icon-btn usr-danger"
              onClick={handleLogoutClick}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-overlay">
          <div className="logout-box">
            <h3 className="logout-title">Leaving already?</h3>
            <p className="logout-msg">Are you sure you want to sign out?</p>
            <div className="logout-actions">
              <button
                className="l-btn l-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="l-btn l-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ UPGRADE MODAL */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          navigate("/pricing");
        }}
      />
    </>
  );
};

export default UserSidebar;
