import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaBars,
  FaEdit,
  FaSave,
  FaPrint,
  FaBookOpen,
  FaTimes,
  FaCheckCircle,
  FaUniversity,
} from "react-icons/fa";
import { useUser } from "../../../../context/UserContext";
import { showConfirmAlert } from "../../../../utils/AlertHelper";

const MakerSidebar = ({
  onOpenMenu,
  isMenuOpen,
  isCollapsed,
  onCancel,
  onSave,
  onPrint,
  isManualMode,
  toggleManualMode,
  isPaperComplete,
}) => {
  const [activeTab, setActiveTab] = useState("menu");
  const { user } = useUser();

  const instituteName =
    user?.institute?.name || user?.instituteName || "Institute Panel";
  const username = user?.name || user?.username || "User";

  useEffect(() => {
    // ✅ SAFETY FIX: Check if onOpenMenu exists and is a function before calling
    if (activeTab === "menu" && typeof onOpenMenu === "function") {
      onOpenMenu();
    }
  }, []);

  useEffect(() => {
    if (!isMenuOpen && activeTab === "menu") setActiveTab("");
  }, [isMenuOpen, activeTab]);

  const handleNavigation = (tab) => {
    if (tab === "edit") {
      if (typeof toggleManualMode === "function") toggleManualMode();
      setActiveTab(!isManualMode ? "edit" : "");
      return;
    }
    if (isMenuOpen && tab !== "menu") return;
    setActiveTab(tab);

    // ✅ SAFETY FIX: Added typeof checks for all prop functions to prevent crashes
    if (tab === "menu" && typeof onOpenMenu === "function") onOpenMenu();
    if (tab === "save" && typeof onSave === "function") onSave();

    if (tab === "print_single" || tab === "print_dh") {
      const mode = tab === "print_single" ? "SINGLE" : "DUAL_H";
      if (!isPaperComplete) {
        Swal.fire({
          title: "Paper Incomplete!",
          text: "Aap ka paper abhi mukammal nahi hai. Kya aap waqai is adhoore paper ka draft print karna chahte hain?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#0ea5e9",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Yes, Print Draft",
          cancelButtonText: "Cancel",
          background: "#0f172a",
          color: "#ffffff",
        }).then((result) => {
          if (result.isConfirmed && typeof onPrint === "function") {
            onPrint(mode);
          }
        });
      } else {
        if (typeof onPrint === "function") onPrint(mode);
      }
    }
  };

  const confirmExit = async () => {
    const result = await showConfirmAlert({
      title: "Discard Paper?",
      text: "All progress will be lost. You will return to Dashboard.",
      confirmButtonText: "Discard & Exit",
    });
    if (result.isConfirmed && typeof onCancel === "function") onCancel();
  };

  return (
    <div
      className={`relative h-full bg-card rounded-2xl shadow-xl border border-border flex flex-col transition-all duration-300 z-100 shrink-0 ${isCollapsed ? "w-20" : "w-65"}`}
    >
      <div
        className={`flex flex-col items-center text-center transition-all duration-300 ${isCollapsed ? "p-4 min-h-24" : "pt-8 pb-5 px-3 min-h-44"}`}
      >
        <div
          className={`rounded-full bg-bg-body border-2 border-border flex items-center justify-center text-accent-1 overflow-hidden shadow-sm transition-all duration-300 ${isCollapsed ? "w-12 h-12 text-xl mb-1" : "w-28 h-28 text-4xl mb-4"}`}
        >
          {user?.institute?.logo ? (
            <img
              src={user.institute.logo}
              alt="Institute"
              className="w-full h-full object-contain"
            />
          ) : (
            <FaUniversity />
          )}
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in flex flex-col items-center">
            <h3 className="m-0 text-lg font-extrabold text-main uppercase tracking-wide truncate max-w-47.5">
              {username}
            </h3>
            <span className="text-xs text-muted mt-1 font-semibold uppercase">
              Paper Maker
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-border mx-6 mb-4 opacity-60"></div>

      <div
        className={`flex-1 flex flex-col gap-2 pb-4 transition-all duration-300 ${isCollapsed ? "px-2 items-center" : "px-4"} ${isMenuOpen ? "opacity-50 pointer-events-none grayscale" : ""}`}
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

        <div className="relative group w-full">
          <button
            onClick={() => handleNavigation("save")}
            disabled={!isPaperComplete}
            className={`flex items-center gap-4 rounded-xl border-none text-sm font-semibold transition-all duration-200 w-full ${isCollapsed ? "w-12 h-12 justify-center p-0" : "px-4 py-3 text-left"} ${
              isPaperComplete
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md cursor-pointer"
                : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70"
            }`}
          >
            <div className="w-6 flex justify-center text-lg">
              <FaSave />
            </div>
            {!isCollapsed && <span className="truncate">Save Paper</span>}
          </button>

          {!isPaperComplete && (
            <div
              className={`absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2.5 bg-slate-800 text-white text-[0.8rem] font-bold rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-99999 pointer-events-none ${isCollapsed ? "ml-5" : ""}`}
            >
              Please complete your paper first to save it.
              <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
            </div>
          )}
        </div>

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
          className={`flex items-center gap-4 rounded-xl border-none bg-transparent text-sm font-semibold cursor-pointer transition-all duration-200 text-red-500 hover:bg-red-500/10 ${isCollapsed ? "w-12 h-12 justify-center p-0" : "w-full px-4 py-3 text-left"}`}
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
      className={`flex items-center gap-4 rounded-xl border-none bg-transparent text-sm font-semibold cursor-pointer transition-all duration-200 ${isCollapsed ? "w-12 h-12 justify-center p-0" : "w-full px-4 py-3 text-left"} ${isActive ? "bg-accent-1/10 text-accent-1 font-bold dark:bg-accent-1/20" : `hover:bg-pill-bg hover:translate-x-1 ${color}`}`}
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

export default React.memo(MakerSidebar);
