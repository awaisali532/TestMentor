import React from "react";
import { Trash2, X } from "lucide-react";

const BulkActionsBar = ({ selectedCount, onDeleteBulk, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
          {selectedCount} Selected
        </span>

        <button
          onClick={onDeleteBulk}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-xs font-bold text-white transition-all shadow-md"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Selected</span>
        </button>

        <button
          onClick={onClearSelection}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
