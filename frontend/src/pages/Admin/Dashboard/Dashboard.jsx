import React, { useState, useEffect } from "react";
import axios from "axios";
import StatCard from "../../../components/Admin/Dashboard/StatCard/StatCard";
import {
  FaQuestion,
  FaBookOpen,
  FaGraduationCap,
  FaUsers,
  FaSpinner,
} from "react-icons/fa";

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

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <FaSpinner className="icon-spin fs-1 text-primary" />
      </div>
    );

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Admin Dashboard</h3>
          <p className="text-muted small m-0">Overview of your system</p>
        </div>
      </div>

      {/* 1. STAT CARDS ROW */}
      <div className="row g-4">
        {/* Total Questions */}
        <div className="col-md-3">
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions.toLocaleString()}
            icon={<FaQuestion />}
            colorType="blue"
          />
        </div>

        {/* Active Subjects */}
        <div className="col-md-3">
          <StatCard
            title="Active Subjects"
            value={stats.activeSubjects}
            icon={<FaBookOpen />}
            colorType="green"
          />
        </div>

        {/* Class Levels */}
        <div className="col-md-3">
          <StatCard
            title="Class Levels"
            value={stats.classLevels}
            icon={<FaGraduationCap />}
            colorType="orange"
          />
        </div>

        {/* Total Users */}
        <div className="col-md-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers />}
            colorType="cyan"
          />
        </div>
      </div>

      {/* ✨ CLEAN LOOK: 
         No graphs, no lists. Just the numbers that matter.
      */}

      <div className="mt-5 text-center text-muted">
        <small>Select an option from the sidebar to manage content.</small>
      </div>
    </div>
  );
};

export default Dashboard;
