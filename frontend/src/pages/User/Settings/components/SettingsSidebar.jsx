import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBuilding, FaCamera, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";

const SettingsSidebar = ({ currentTab, hasUnsavedChanges }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "personal", label: "Personal Data", icon: FaUser },
    { id: "institute", label: "Institute Data", icon: FaBuilding },
    { id: "photo", label: "Media & Photos", icon: FaCamera },
    { id: "password", label: "Change Password", icon: FaLock },
  ];

  const handleTabSwitch = (e, tabId) => {
    e.preventDefault();
    if (currentTab === tabId) return;

    if (hasUnsavedChanges) {
      Swal.fire({
        title: "Unsaved Changes!",
        text: "You have unsaved changes. Do you really want to leave without saving?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#334155",
        confirmButtonText: "Yes, discard changes",
        cancelButtonText: "No, stay here",
        background: "#0f172a",
        color: "#ffffff",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/user/settings?tab=${tabId}`);
        }
      });
    } else {
      navigate(`/user/settings?tab=${tabId}`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={(e) => handleTabSwitch(e, tab.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
            currentTab === tab.id
              ? "bg-accent-1/10 text-accent-1 shadow-sm border border-accent-1/20"
              : "text-muted hover:bg-pill-bg hover:text-main"
          }`}
        >
          <tab.icon size={18} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsSidebar;
