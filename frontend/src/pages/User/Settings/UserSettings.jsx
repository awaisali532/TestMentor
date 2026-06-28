import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

import SettingsSidebar from "./components/SettingsSidebar";
import SubscriptionCard from "./components/SubscriptionCard";
import PersonalTab from "./components/PersonalTab";
import InstituteTab from "./components/InstituteTab";
import PhotoTab from "./components/PhotoTab";
import PasswordTab from "./components/PasswordTab";

const UserSettings = () => {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "personal";

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  if (!user) return null;

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
