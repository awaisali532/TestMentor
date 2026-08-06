import React from "react";

const SiteSettings = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
        <h1 className="text-2xl font-extrabold text-main mb-2">
          Site Settings ⚙️
        </h1>
        <p className="text-sm text-muted">
          Global system configurations and SuperAdmin parameters.
        </p>
      </div>
    </div>
  );
};

export default SiteSettings;
