import React from "react";
import { PlusCircle, RefreshCw, HelpCircle, CheckCircle2, FileQuestion, AlignLeft } from "lucide-react";

const QuestionBankHeader = ({
  counts,
  loading,
  refreshing,
  onRefresh,
  onOpenAddModal,
  onOpenBulkModal,
}) => {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-main">
              Question Bank Master
            </h1>
          </div>
          <p className="text-sm text-muted">
            Manage MCQs, Short Questions, and Long Questions repository with dual-language support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-main text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenBulkModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-sm font-bold shadow-xs transition-all active:scale-95"
          >
            <span>⚡ Bulk Add Questions</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Quick Counter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            <FileQuestion className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Total Questions</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {loading ? "..." : (counts?.total ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">MCQs Count</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {loading ? "..." : (counts?.mcq ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
            <AlignLeft className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Short Questions</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {loading ? "..." : (counts?.short ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
            <AlignLeft className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Long Questions</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {loading ? "..." : (counts?.long ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankHeader;
