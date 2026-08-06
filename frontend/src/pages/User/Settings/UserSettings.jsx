import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaLock, FaFlask, FaShieldAlt } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";

import SettingsSidebar from "./components/SettingsSidebar";
import SubscriptionCard from "./components/SubscriptionCard";
import PersonalTab from "./components/PersonalTab";
import InstituteTab from "./components/InstituteTab";
import PhotoTab from "./components/PhotoTab";
import PasswordTab from "./components/PasswordTab";

const UserSettings = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "personal";
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Admin Test Mode: Admin in User workspace can ONLY test paper generation
  const isAdminTestMode = user?.isSuperAdmin || user?.role === "admin";

  if (!user) return null;

  // If Admin is in Test Mode, show a locked screen with explanation
  if (isAdminTestMode) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in pb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-main mb-1 tracking-tight">
            Account Settings
          </h2>
          <p className="text-muted text-lg">
            Manage your profile, preferences, and subscriptions.
          </p>
        </div>

        {/* ADMIN TEST MODE LOCK BANNER */}
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center bg-card border border-border rounded-2xl shadow-sm">
          <div className="size-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <FaFlask size={36} />
          </div>
          <div className="flex flex-col gap-2 max-w-md mx-auto px-4">
            <h3 className="text-2xl font-extrabold text-main flex items-center justify-center gap-2">
              <FaLock className="text-amber-500" size={18} />
              Test Mode Active
            </h3>
            <p className="text-muted text-base leading-relaxed">
              You are currently in <span className="font-bold text-amber-500">Admin Test Mode</span>. 
              Profile settings, institute details, and account changes are disabled.
            </p>
            <p className="text-muted text-sm">
              This mode is for <strong>testing paper generation only</strong>. 
              All test papers will be automatically deleted when you return to Admin Panel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => navigate("/user/generate-paper")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-1 text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <FaFlask size={14} />
              Go to Paper Generator
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer"
            >
              <FaShieldAlt size={14} />
              Return to Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "personal":
        return (
          <PersonalTab
            user={user}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        );
      case "institute":
        return (
          <InstituteTab
            user={user}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        );
      case "photo":
        return <PhotoTab user={user} />;
      case "password":
        return <PasswordTab setHasUnsavedChanges={setHasUnsavedChanges} />;
      default:
        return (
          <PersonalTab
            user={user}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-main mb-1 tracking-tight">
          Account Settings
        </h2>
        <p className="text-muted text-lg">
          Manage your profile, preferences, and subscriptions.
        </p>
      </div>

      {/* ✅ FLEX LAYOUT FOR MOBILE RESPONSIVENESS */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN (Desktop) / TOP COLUMN (Mobile) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 lg:sticky lg:top-4 shrink-0">
          <SettingsSidebar
            currentTab={currentTab}
            hasUnsavedChanges={hasUnsavedChanges}
          />

          {/* ✅ Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block">
            <SubscriptionCard user={user} />
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="flex-1 w-full bg-card border border-border rounded-2xl p-5 md:p-8 shadow-sm transition-all duration-300 min-h-100">
          {renderTabContent()}
        </div>

        {/* ✅ MOBILE ONLY: Subscription card moves to the bottom */}
        <div className="block lg:hidden w-full">
          <SubscriptionCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
