import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Link added for navigation
import {
  FaPlus,
  FaLaptopCode,
  FaHistory,
  FaBookmark,
  FaEye,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import DashboardActionCard from "../../../components/DashboardActionCard/DashboardActionCard";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user } = useUser();
  const currentUser = user || { name: "User", usage: { papersGenerated: 0 } };

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATE ---
  const [savedCount, setSavedCount] = useState(0);
  const [recentPapers, setRecentPapers] = useState([]); // ✅ Recent papers store krne k liye
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch Papers
        const res = await axios.get(`${BASE_URL}/api/papers/my-papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const allPapers = res.data.papers;

          // 1. Total Count set kro
          setSavedCount(allPapers.length);

          // 2. Sirf pehle 5 papers (Recent) nikal kr set kro
          setRecentPapers(allPapers.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Limits Logic
  const isFree = currentUser.planType !== "premium";
  const limitReached = isFree && (currentUser.usage?.papersGenerated || 0) >= 1;

  return (
    <div className="ud-container">
      {/* --- HERO SECTION --- */}
      <div className="ud-hero">
        <div>
          <h2 className="ud-welcome">
            Welcome back,{" "}
            <span className="text-gradient">{currentUser.name}!</span> 👋
          </h2>
          <p className="ud-subtitle">
            Here is what's happening with your account today.
          </p>
        </div>
        <div className="ud-plan-badge">
          {isFree ? (
            <span className="badge-pill free">Free Plan (1 Paper Limit)</span>
          ) : (
            <span className="badge-pill premium">Premium Member</span>
          )}
        </div>
      </div>

      {/* --- GRID SECTION --- */}
      <div className="ud-grid">
        {/* 1. Generate Paper Card */}
        <DashboardActionCard
          title="Generate Paper"
          description="Create professional PDF papers."
          icon={<FaPlus />}
          tag="Core Feature"
          glowClass="blue-glow"
          btnClass="btn-blue"
          link="/user/generate-paper"
          isLocked={limitReached}
          buttonText="Create Now"
        />

        {/* 2. Online Test Card */}
        <DashboardActionCard
          title="Online Test"
          description="Attempt MCQs and check result."
          icon={<FaLaptopCode />}
          tag="Practice"
          glowClass="purple-glow"
          btnClass="btn-purple"
          link="/user/online-test"
          isLocked={false}
          buttonText="Start Quiz"
        />

        {/* 3. Saved Papers Card */}
        <DashboardActionCard
          title="Saved Papers"
          description="Access your previously created papers."
          icon={<FaBookmark />}
          tag={loading ? "Loading..." : `${savedCount} Saved`}
          glowClass="yellow-glow"
          btnClass="btn-yellow"
          link="/user/saved-papers"
          isLocked={false}
          buttonText="View All"
        />

        {/* 4. Stats Card */}
        <div className="ud-card stats-card">
          <div className="stats-header">
            <span>Paper Usage</span>
            <FaHistory className="text-muted" />
          </div>
          <div className="stats-body">
            <h3 className="stats-number">
              {currentUser.usage?.papersGenerated || 0}{" "}
              <span className="total">/ {isFree ? "1" : "∞"}</span>
            </h3>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: isFree
                    ? `${
                        ((currentUser.usage?.papersGenerated || 0) / 1) * 100
                      }%`
                    : "100%",
                  background: limitReached ? "#ef4444" : "#10b981",
                  boxShadow: limitReached
                    ? "0 0 10px #ef4444"
                    : "0 0 10px #10b981",
                }}
              ></div>
            </div>
            <small className="stats-sub">
              {limitReached ? "Limit Reached" : "You can generate more."}
            </small>
          </div>
        </div>
      </div>

      {/* --- ✅ RECENT ACTIVITY SECTION (Dynamic Data) --- */}
      <div className="ud-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="section-title mb-0">Recent Activity</h4>
          <Link
            to="/user/saved-papers"
            className="btn btn-sm btn-outline-primary"
          >
            View All
          </Link>
        </div>

        <div className="ud-table-wrapper">
          {loading ? (
            <p className="text-muted p-3">Loading recent activity...</p>
          ) : recentPapers.length === 0 ? (
            <div className="text-center p-4 text-muted bg-light rounded">
              No papers generated yet. Start by creating one!
            </div>
          ) : (
            <table className="ud-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPapers.map((paper) => (
                  <tr key={paper._id}>
                    <td className="fw-bold text-main">{paper.title}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {paper.subject}
                      </span>
                    </td>
                    <td>{paper.grade}</td>
                    <td className="text-muted small">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {/* View Link - Goes to Saved Papers page logic */}
                      <Link
                        to="/user/saved-papers"
                        state={{ highlight: paper._id }} // Optional: Highlight logic agr lgana chaho
                        className="btn-icon-small"
                        title="View"
                      >
                        <FaEye />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
