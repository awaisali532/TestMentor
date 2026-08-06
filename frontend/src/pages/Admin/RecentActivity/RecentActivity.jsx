import React from "react";

const RecentActivity = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
        <h1 className="text-2xl font-extrabold text-main mb-2">
          Recent System Activity 📜
        </h1>
        <p className="text-sm text-muted">
          View system logs, user logins, and paper generation activity.
        </p>
      </div>
    </div>
  );
};

export default RecentActivity;
