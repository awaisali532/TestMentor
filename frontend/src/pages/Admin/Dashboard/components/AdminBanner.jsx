import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, RefreshCw, PlusCircle } from "lucide-react";

const AdminBanner = ({ user, refreshing, onRefresh }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 md:p-8 text-white shadow-xl">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SuperAdmin Control Center</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Admin"} 👋
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            Overview of TestMentor platform metrics, user activities, and system status.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-sm font-medium transition-all backdrop-blur-md border border-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh Stats"}</span>
          </button>

          <Link
            to="/admin/question-bank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-sm font-bold shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Question</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminBanner;
