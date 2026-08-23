import React from "react";
import { Link } from "react-router-dom";
import { Database, ArrowRight, Layers } from "lucide-react";

const SubjectDistribution = ({ graphData, loading }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-main flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>Question Distribution by Subject</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Top subjects with the highest number of questions stored
          </p>
        </div>
        <Link
          to="/admin/subjects"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full"></div>
            </div>
          ))}
        </div>
      ) : graphData && graphData.length > 0 ? (
        <div className="space-y-4 py-2">
          {graphData.map((item, index) => {
            const maxCount = Math.max(...graphData.map((d) => d.count || 1));
            const percentage = Math.round(((item.count || 0) / maxCount) * 100);

            return (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-main">{item.label}</span>
                  <span className="text-muted font-bold">{item.count} Questions</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-border/40">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-muted text-sm space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-400" />
          <p>No question breakdown data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default SubjectDistribution;
