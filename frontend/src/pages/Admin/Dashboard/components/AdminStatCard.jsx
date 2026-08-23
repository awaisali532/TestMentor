import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AdminStatCard = ({ card, loading }) => {
  const IconComp = card.icon;

  return (
    <Link
      to={card.link}
      className={`group relative overflow-hidden rounded-2xl bg-card border ${card.borderColor} p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
          <IconComp className="w-6 h-6" />
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
          Real-time
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted mb-1">
          {card.title}
        </h3>
        <div className="text-3xl font-black text-main tracking-tight">
          {loading ? (
            <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md"></span>
          ) : (
            card.value.toLocaleString()
          )}
        </div>
        <p className="text-xs text-muted mt-2 font-medium">
          {card.subText}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
        <span>Manage Module</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
};

export default AdminStatCard;
