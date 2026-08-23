import React from "react";
import { Link } from "react-router-dom";
import { UserCheck } from "lucide-react";

const RecentUsersTable = ({ users, loading }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-base font-bold text-main flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <span>Recent Registrations</span>
        </h2>
        <Link
          to="/admin/users"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          <div className="py-8 text-center text-muted text-xs">Loading recent users...</div>
        ) : users && users.length > 0 ? (
          users.map((u, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="text-sm font-bold text-main">{u.name}</div>
                  <div className="text-xs text-muted">{u.email}</div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    u.role === "admin" || u.role === "superadmin"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  }`}
                >
                  {u.role || "User"}
                </span>
                <div className="text-[11px] text-muted mt-0.5">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted text-xs">No recent users found.</div>
        )}
      </div>
    </div>
  );
};

export default RecentUsersTable;
