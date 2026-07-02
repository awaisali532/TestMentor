import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaEdit,
  FaSave,
  FaPrint,
  FaBookOpen,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaUniversity,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useUser } from "../../../../context/UserContext"; // ✅ Real Data

const MakerSidebar = ({
  paperData,
  onOpenMenu,
  isMenuOpen,
  isCollapsed,
  toggleCollapse,
  onCancel,
  onSave,
  onPrint,
  isManualMode,
  toggleManualMode,
}) => {
  const [activeTab, setActiveTab] = useState("menu");
  const { user } = useUser(); // ✅ Fetch real user/institute info

  const instituteName =
    user?.institute?.name || user?.instituteName || "Institute Panel";
  const instituteLogo =
    user?.institute?.logo?.url || user?.institute?.image || null;

  useEffect(() => {
    if (activeTab === "menu") onOpenMenu();
  }, []);
  useEffect(() => {
    if (!isMenuOpen && activeTab === "menu") setActiveTab("");
  }, [isMenuOpen, activeTab]);

  const handleNavigation = (tab) => {
    if (tab === "edit") {
      toggleManualMode();
      setActiveTab(!isManualMode ? "edit" : "");
      return;
    }
    if (isMenuOpen && tab !== "menu") return;

    setActiveTab(tab);
    if (tab === "menu") onOpenMenu();
    if (tab === "save" && onSave) onSave();
    if (tab === "print_single" && onPrint) onPrint("SINGLE");
    if (tab === "print_dh" && onPrint) onPrint("DUAL_H");
  };

  const confirmExit = () => {
    Swal.fire({
      title: "Discard Paper?",
      text: "All progress will be lost. You will return to Dashboard.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Discard & Exit",
      background: "#0f172a",
      color: "#ffffff",
    }).then((result) => {
      if (result.isConfirmed && onCancel) onCancel();
    });
  };

  return (
    <div
      className={`relative h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-40 shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.02)] ${isCollapsed ? "w-20" : "w-72"}`}
    >
      <button
        onClick={toggleCollapse}
        className="absolute top-5 -right-4 size-8 bg-accent-1 text-white border-none rounded-full flex items-center justify-center cursor-pointer shadow-md z-100 transition-transform hover:scale-110"
      >
        {isCollapsed ? (
          <FaChevronRight size={12} />
        ) : (
          <FaChevronLeft size={12} />
        )}
      </button>

      {/* ✅ Real Institute Logo Section */}
      <div
        className={`flex flex-col items-center text-center transition-all duration-300 ${isCollapsed ? "p-4 min-h-24" : "pt-8 pb-5 px-3 min-h-44"}`}
      >
        <div
          className={`rounded-xl bg-bg-body border-2 border-border flex items-center justify-center text-accent-1 overflow-hidden shadow-sm transition-all duration-300 ${isCollapsed ? "size-12 text-xl mb-1" : "size-20 text-4xl mb-4"}`}
        >
          {user?.institute?.logo ? (
            <img
              src={user.institute.logo}
              alt="Institute"
              className="w-full h-full object-contain "
            />
          ) : (
            <FaUniversity />
          )}
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in flex flex-col items-center">
            <h3 className="m-0 text-lg font-extrabold text-main uppercase tracking-wide truncate max-w-48">
              {instituteName}
            </h3>
            <span className="text-xs text-muted mt-1 font-semibold uppercase">
              Paper Maker
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-border mx-6 mb-4 opacity-60"></div>

      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-2 transition-all duration-300 custom-scrollbar ${isCollapsed ? "px-2 items-center" : "px-4"} ${isMenuOpen ? "opacity-50 pointer-events-none grayscale" : ""}`}
      >
        <MenuItem
          icon={<FaBars />}
          label="Question's Menu"
          tab="menu"
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          onClick={handleNavigation}
        />
        <MenuItem
          icon={isManualMode ? <FaCheckCircle /> : <FaEdit />}
          label={isManualMode ? "Done Editing" : "Manual Editing"}
          tab="edit"
          activeTab={isManualMode ? "edit" : ""}
          isCollapsed={isCollapsed}
          onClick={handleNavigation}
        />
        <MenuItem
          icon={<FaSave />}
          label="Save Paper"
          tab="save"
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          onClick={handleNavigation}
          color="text-emerald-500"
        />
        <div className="h-4"></div>
        <MenuItem
          icon={<FaPrint />}
          label="Print Single"
          tab="print_single"
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          onClick={handleNavigation}
        />
        <MenuItem
          icon={<FaBookOpen />}
          label="Print Double (H)"
          tab="print_dh"
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          onClick={handleNavigation}
        />
        <div className="h-4"></div>
        <button
          onClick={confirmExit}
          title="Cancel Paper"
          className={`flex items-center gap-4 rounded-xl border-none bg-transparent text-sm font-semibold cursor-pointer transition-all duration-200 text-red-500 hover:bg-red-500/10 ${isCollapsed ? "size-12 justify-center p-0" : "w-full px-4 py-3 text-left"}`}
        >
          <div className="w-6 flex justify-center text-lg">
            <FaTimes />
          </div>
          {!isCollapsed && <span className="truncate">Cancel Paper</span>}
        </button>
      </div>
    </div>
  );
};

const MenuItem = ({
  icon,
  label,
  tab,
  activeTab,
  isCollapsed,
  onClick,
  color = "text-main",
}) => {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      title={isCollapsed ? label : ""}
      className={`flex items-center gap-4 rounded-xl border-none bg-transparent text-sm font-semibold cursor-pointer transition-all duration-200 ${isCollapsed ? "size-12 justify-center p-0" : "w-full px-4 py-3 text-left"} ${isActive ? "bg-accent-1/10 text-accent-1 font-bold dark:bg-accent-1/20" : `hover:bg-pill-bg hover:translate-x-1 ${color}`}`}
    >
      <div
        className={`w-6 flex justify-center text-lg ${isActive ? "text-accent-1" : color}`}
      >
        {icon}
      </div>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );
};

export default MakerSidebar;
