import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Zap } from "lucide-react";

const PlatformHealth = () => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold text-main flex items-center gap-2 border-b border-border pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Platform Health</span>
        </h2>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-semibold text-main">API Service</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-main">MongoDB Connection</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-main">LaTeX / MathEngine</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">KaTeX Active</span>
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Quick Controls
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/admin/users"
            className="p-2.5 text-xs font-semibold text-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            👥 Users List
          </Link>
          <Link
            to="/admin/paper-patterns"
            className="p-2.5 text-xs font-semibold text-center rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            📝 Paper Patterns
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlatformHealth;
