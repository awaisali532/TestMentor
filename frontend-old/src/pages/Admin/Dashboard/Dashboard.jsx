import React, { useState, useEffect } from "react";
import axios from "axios";
import StatCard from "../../../components/Admin/Dashboard/StatCard/StatCard";
import {
  FaQuestion,
  FaBookOpen,
  FaGraduationCap,
  FaUsers,
} from "react-icons/fa"; // ❌ FaSpinner removed
import "./Dashboard.css";

// ✅ Import TMLoader
import TMLoader from "../../../components/common/TMLoader/TMLoader";

const Dashboard = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATE ---
  const [stats, setStats] = useState({
    totalQuestions: 0,
    activeSubjects: 0,
    classLevels: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(`${BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ✅ Updated Loader Logic
  if (loading) return <TMLoader />;

  return (
    <div className="dashboard-wrapper p-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold text-main m-0">Admin Dashboard</h2>
          <p className="text-muted small m-0">System Overview & Statistics</p>
        </div>
      </div>

      {/* 1. STAT CARDS ROW */}
      <div className="row g-4">
        {/* Total Questions */}
        <div className="col-md-3">
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions?.toLocaleString() || 0}
            icon={<FaQuestion />}
            colorType="blue"
          />
        </div>

        {/* Active Subjects */}
        <div className="col-md-3">
          <StatCard
            title="Active Subjects"
            value={stats.activeSubjects || 0}
            icon={<FaBookOpen />}
            colorType="green"
          />
        </div>

        {/* Class Levels */}
        <div className="col-md-3">
          <StatCard
            title="Class Levels"
            value={stats.classLevels || 0}
            icon={<FaGraduationCap />}
            colorType="orange"
          />
        </div>

        {/* Total Users */}
        <div className="col-md-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={<FaUsers />}
            colorType="cyan"
          />
        </div>
      </div>

      {/* Footer / Empty State */}
      <div className="mt-3 text-center text-muted">
        <small>Select an option from the sidebar to manage content.</small>
      </div>
    </div>
  );
};

export default Dashboard;
