import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, FileText, HelpCircle, BookOpen } from "lucide-react";
import { useUser } from "../../../context/UserContext";

// Modular Components
import AdminBanner from "./components/AdminBanner";
import AdminStatCard from "./components/AdminStatCard";
import SubjectDistribution from "./components/SubjectDistribution";
import PlatformHealth from "./components/PlatformHealth";
import RecentUsersTable from "./components/RecentUsersTable";
import RecentPapersTable from "./components/RecentPapersTable";

const AdminDashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchStats = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Failed to load real-time platform statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalUsers ?? 0,
      subText: `${stats?.premiumUsers ?? 0} Premium / Admin accounts`,
      icon: Users,
      color: "from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/50",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      link: "/admin/users",
    },
    {
      title: "Papers Generated",
      value: stats?.totalPapersGenerated ?? 0,
      subText: "Live user-created exam papers",
      icon: FileText,
      color: "from-purple-500/10 to-purple-600/5 text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-900/50",
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      link: "/admin/recent-activity",
    },
    {
      title: "Question Repository",
      value: stats?.totalQuestions ?? 0,
      subText: "Available MCQs & Descriptive Qs",
      icon: HelpCircle,
      color: "from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      link: "/admin/question-bank",
    },
    {
      title: "Active Subjects",
      value: stats?.activeSubjects ?? 0,
      subText: "Configured grade & subject modules",
      icon: BookOpen,
      color: "from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900/50",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      link: "/admin/subjects",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* 1. Top Banner */}
      <AdminBanner
        user={user}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* 2. Error Alert (If Any) */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={handleRefresh}
            className="underline hover:text-red-900 dark:hover:text-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <AdminStatCard key={idx} card={card} loading={loading} />
        ))}
      </div>

      {/* 4. Subject Distribution & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubjectDistribution
            graphData={stats?.graphData}
            loading={loading}
          />
        </div>
        <div>
          <PlatformHealth />
        </div>
      </div>

      {/* 5. Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentUsersTable users={stats?.recentUsers} loading={loading} />
        <RecentPapersTable papers={stats?.recentPapers} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
