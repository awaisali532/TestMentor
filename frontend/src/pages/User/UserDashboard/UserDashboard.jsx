import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaLaptopCode,
  FaHistory,
  FaBookmark,
  FaEye,
  FaCrown,
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import DashboardActionCard from "../../../components/DashboardActionCard/DashboardActionCard";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user } = useUser();
  const currentUser = user || {
    name: "User",
    planType: "free",
    usage: { papersGenerated: 0 },
  };

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [savedCount, setSavedCount] = useState(0);
  const [recentPapers, setRecentPapers] = useState([]);

  const [limitData, setLimitData] = useState({
    usage: 0,
    limit: 1,
    isUnlimited: false,
  });

  // ✅ Loading State (By default TRUE)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // ✅ Loading start
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const papersRes = await axios.get(`${BASE_URL}/api/papers/my-papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statsRes = await axios.get(`${BASE_URL}/api/usage/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (papersRes.data.success) {
          setSavedCount(papersRes.data.papers.length);
          setRecentPapers(papersRes.data.papers.slice(0, 5));
        }

        if (statsRes.data.success) {
          const { usage, limit } = statsRes.data;
          setLimitData({
            usage: usage,
            limit: limit === -1 ? 100 : limit,
            isUnlimited: limit === -1,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        // ✅ Loading sirf tab false hoga jab sab data aa chuka ho
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isFree = !limitData.isUnlimited;
  const papersGenerated = limitData.usage;
  const maxLimit = limitData.limit;
  const limitReached = isFree && papersGenerated >= maxLimit;

  let progressPercentage = 0;
  if (isFree) {
    progressPercentage = (papersGenerated / maxLimit) * 100;
    if (progressPercentage > 100) progressPercentage = 100;
  } else {
    progressPercentage = 100;
  }

  return (
    <div className="ud-container">
      {/* HERO SECTION */}
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
          {/* ✅ Loader for Badge */}
          {loading ? (
            <div className="skeleton skeleton-badge"></div>
          ) : isFree ? (
            <span className="badge-pill free">
              Free Plan ({maxLimit} Paper Limit)
            </span>
          ) : (
            <span className="badge-pill premium">
              <FaCrown className="me-1" /> Premium Member
            </span>
          )}
        </div>
      </div>

      <div className="ud-grid">
        <DashboardActionCard
          title="Generate Paper"
          description="Create professional PDF papers."
          icon={<FaPlus />}
          tag="Core Feature"
          glowClass="blue-glow"
          btnClass="btn-blue"
          link="/user/generate-paper"
          // ✅ Jab tak loading hai, button lock mat dikhao taake user confuse na ho, ya disabled rakho
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
          glowClass="purple-glow"
          btnClass="btn-purple"
          link="/user/online-test"
          isLocked={false}
          buttonText="Start Quiz"
        />

        <DashboardActionCard
          title="Saved Papers"
          description="Access your previously created papers."
          icon={<FaBookmark />}
          // ✅ Loader for Tag
          tag={loading ? "Loading..." : `${savedCount} Saved`}
          glowClass="yellow-glow"
          btnClass="btn-yellow"
          link="/user/saved-papers"
          isLocked={false}
          buttonText="View All"
        />

        {/* --- USAGE STATS CARD (UPDATED WITH LOADER) --- */}
        <div className="ud-card stats-card">
          <div className="stats-header">
            <span>Paper Usage</span>
            <FaHistory className="text-muted" />
          </div>

          <div className="stats-body">
            {/* ✅ AGAR LOADING HAI TO SKELETON DIKHAO */}
            {loading ? (
              <>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-bar"></div>
              </>
            ) : (
              <>
                <h3 className="stats-number">
                  {papersGenerated}{" "}
                  <span className="total">/ {isFree ? maxLimit : "∞"}</span>
                </h3>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${progressPercentage}%`,
                      background: limitReached ? "#ef4444" : "#10b981",
                      boxShadow: limitReached
                        ? "0 0 10px rgba(239, 68, 68, 0.5)"
                        : "0 0 10px rgba(16, 185, 129, 0.5)",
                    }}
                  ></div>
                </div>

                <small className="stats-sub">
                  {isFree ? (
                    limitReached ? (
                      <span className="text-danger fw-bold">Limit Reached</span>
                    ) : (
                      `${maxLimit - papersGenerated} remaining`
                    )
                  ) : (
                    <span className="text-success fw-bold">
                      Unlimited Access
                    </span>
                  )}
                </small>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
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

        <div className="ud-table-wrapper activity-table-wrapper">
          {loading ? (
            // ✅ Table Loading State
            <p className="p-3 ud-text-muted">Loading recent activity...</p>
          ) : recentPapers.length === 0 ? (
            <div className="ud-empty-box">
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
                    <td className="fw-bold ud-text-main">{paper.title}</td>
                    <td>
                      <span className="ud-badge">{paper.subject}</span>
                    </td>
                    <td className="ud-text-main">{paper.grade}</td>
                    <td className="ud-text-muted small">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <Link
                        to="/user/saved-papers"
                        state={{ highlight: paper._id }}
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
