import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaLaptopCode,
  FaBookmark,
  FaHistory,
  FaCrown,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";

// Components
import DashboardActionCard from "./components/DashboardActionCard";
import RecentActivityTable from "./components/RecentActivityTable";

const UserDashboard = () => {
  const { user } = useUser();
  const currentUser = user || { name: "User", planType: "free" };
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [savedCount, setSavedCount] = useState(0);
  const [recentPapers, setRecentPapers] = useState([]);
  const [limitData, setLimitData] = useState({
    usage: 0,
    limit: 1,
    isUnlimited: false,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // ✅ STEP 1: CACHE CHECK (Reload par foran data dikhane ke liye)
      const cachedData = localStorage.getItem("tm_dashboard_cache");

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setSavedCount(parsedData.savedCount);
        setRecentPapers(parsedData.recentPapers);
        setLimitData(parsedData.limitData);
        setLoading(false); // Cache mil gaya, loading foran khatam
        setIsRefreshing(true); // Background refresh chalu
      } else {
        setLoading(true); // Pehli dafa aane par loading zaroori hai
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [papersRes, statsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/papers/my-papers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/usage/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let newSavedCount = savedCount;
        let newRecentPapers = recentPapers;
        let newLimitData = limitData;

        if (papersRes.data.success) {
          newSavedCount = papersRes.data.papers.length;
          newRecentPapers = papersRes.data.papers.slice(0, 5);

          setSavedCount(newSavedCount);
          setRecentPapers(newRecentPapers);
        }

        if (statsRes.data.success) {
          const { usage, limit } = statsRes.data;
          newLimitData = {
            usage: usage,
            limit: limit === -1 ? 100 : limit,
            isUnlimited: limit === -1,
          };
          setLimitData(newLimitData);
        }

        // ✅ STEP 2: CACHE UPDATE (Naya data anay par Cache update kar do taake aglay reload par kaam aaye)
        localStorage.setItem(
          "tm_dashboard_cache",
          JSON.stringify({
            savedCount: newSavedCount,
            recentPapers: newRecentPapers,
            limitData: newLimitData,
          }),
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchData();
  }, [BASE_URL]);

  const isFree = !limitData.isUnlimited;
  const papersGenerated = limitData.usage;
  const maxLimit = limitData.limit;
  const limitReached = isFree && papersGenerated >= maxLimit;
  const progressPercentage = isFree
    ? Math.min((papersGenerated / maxLimit) * 100, 100)
    : 100;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-10">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-main mb-2 tracking-tight">
            Welcome back,{" "}
            <span className="bg-linear-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
              {currentUser.name}!
            </span>{" "}
            👋
          </h2>
          <p className="text-muted text-lg">
            Here is what's happening with your account today.
          </p>
        </div>

        <div>
          {loading ? (
            <div className="w-32 h-10 bg-border/50 rounded-full animate-pulse"></div>
          ) : isFree ? (
            <span className="flex items-center gap-2 px-5 py-2.5 bg-pill-bg text-muted border border-border rounded-full font-bold text-sm shadow-sm">
              Free Plan ({maxLimit} Limit)
            </span>
          ) : (
            <span className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-yellow-500 to-amber-600 text-white rounded-full font-bold text-sm shadow-lg shadow-yellow-500/30 transition-transform hover:scale-105">
              <FaCrown /> Premium Member
            </span>
          )}
        </div>
      </div>

      {/* GRID CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardActionCard
          title="Generate Paper"
          description="Create professional PDF papers."
          icon={<FaPlus />}
          tag="Core Feature"
          colorTheme="blue"
          link="/user/generate-paper"
          isLocked={!loading && limitReached}
          buttonText={
            loading
              ? "Checking..."
              : limitReached
                ? "Limit Reached"
                : "Create Now"
          }
        />
        <DashboardActionCard
          title="Online Test"
          description="Attempt MCQs and check result."
          icon={<FaLaptopCode />}
          tag="Practice"
          colorTheme="purple"
          link="/user/online-test"
          isLocked={false}
          buttonText="Start Quiz"
        />
        <DashboardActionCard
          title="Saved Papers"
          description="Access your previously created papers."
          icon={<FaBookmark />}
          tag={loading ? "Loading..." : `${savedCount} Saved`}
          colorTheme="yellow"
          link="/user/saved-papers"
          isLocked={false}
          buttonText="View All"
        />

        {/* USAGE STATS CARD */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-55 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center text-muted font-bold text-sm mb-4">
            <span>Paper Usage</span>
            <FaHistory size={16} />
          </div>

          <div className="flex flex-col justify-end h-full">
            {loading ? (
              <div className="space-y-4">
                <div className="h-10 bg-border/50 rounded-lg w-1/2 animate-pulse"></div>
                <div className="h-2.5 bg-border/50 rounded-full w-full animate-pulse"></div>
              </div>
            ) : (
              <>
                <h3 className="text-4xl font-extrabold text-main leading-none mb-4">
                  {papersGenerated}{" "}
                  <span className="text-xl text-muted font-medium">
                    / {isFree ? maxLimit : "∞"}
                  </span>
                </h3>
                <div className="w-full h-2.5 bg-pill-bg border border-border rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: limitReached ? "#ef4444" : "#10b981",
                      boxShadow: limitReached
                        ? "0 0 10px rgba(239,68,68,0.5)"
                        : "0 0 10px rgba(16,185,129,0.5)",
                    }}
                  ></div>
                </div>
                <small className="text-xs font-bold">
                  {isFree ? (
                    limitReached ? (
                      <span className="text-red-500">Limit Reached</span>
                    ) : (
                      <span className="text-muted">
                        {maxLimit - papersGenerated} remaining
                      </span>
                    )
                  ) : (
                    <span className="text-green-500">Unlimited Access</span>
                  )}
                </small>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <RecentActivityTable
        loading={loading}
        papers={recentPapers}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default UserDashboard;
