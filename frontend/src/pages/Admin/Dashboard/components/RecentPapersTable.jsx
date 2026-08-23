import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const RecentPapersTable = ({ papers, loading }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-base font-bold text-main flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span>Recent Generated Papers</span>
        </h2>
        <Link
          to="/admin/recent-activity"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View Activity
        </Link>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          <div className="py-8 text-center text-muted text-xs">Loading recent papers...</div>
        ) : papers && papers.length > 0 ? (
          papers.map((p, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-main truncate max-w-xs">{p.title}</div>
                <div className="text-xs text-muted">
                  {p.subject} • Class {p.grade} • {p.totalMarks} Marks
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-main">
                  {p.user?.name || "System"}
                </div>
                <div className="text-[11px] text-muted">
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted text-xs">No papers generated yet.</div>
        )}
      </div>
    </div>
  );
};

export default RecentPapersTable;
