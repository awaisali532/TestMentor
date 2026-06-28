import React from "react";
import { FaHistory } from "react-icons/fa";

const SubscriptionCard = ({ user }) => {
  const isPaid = user?.planType === "paid" || user?.planType === "premium";
  const papersUsed = user?.usage?.papersGenerated || 0;
  const paperLimit = isPaid ? Infinity : user?.usage?.customPaperLimit || 1;
  const progressPercent = isPaid
    ? 100
    : Math.min((papersUsed / paperLimit) * 100, 100);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Lifetime";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
        <FaHistory className="text-accent-1" />
        <h5 className="font-bold text-main m-0">Subscription Details</h5>
      </div>
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted font-medium">Current Plan:</span>
          <span
            className={`font-extrabold ${isPaid ? "text-yellow-500" : "text-main"}`}
          >
            {isPaid ? "PREMIUM" : "FREE"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted font-medium">Valid Until:</span>
          <span className="font-bold text-main">
            {isPaid ? formatDate(user.subscription?.validUntil) : "Lifetime"}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-muted">Paper Limit</span>
            <span className="text-main">
              {papersUsed} / {isPaid ? "∞" : paperLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-pill-bg border border-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: isPaid
                  ? "#10b981"
                  : papersUsed >= paperLimit
                    ? "#ef4444"
                    : "#10b981",
              }}
            ></div>
          </div>
        </div>
        {!isPaid && (
          <button className="w-full mt-2 bg-linear-to-br from-yellow-500 to-amber-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
