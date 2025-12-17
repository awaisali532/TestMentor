import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaLaptopCode,
  FaHistory,
  FaCrown,
  FaLock,
  FaClock,
} from "react-icons/fa";
import "./UserDashboard.css";

const UserDashboard = () => {
  // 1. Get User Data
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    planType: "free",
    usage: { papersGenerated: 0 },
  };

  // 2. Logic to Check Limits
  const isFree = user.planType === "free";
  const limitReached = isFree && user.usage.papersGenerated >= 1;

  // 3. Mock Activity Data
  const [activities, setActivities] = useState([
    {
      id: 1,
      action: "Generated Paper",
      detail: "Physics 9th Class",
      date: "2 hours ago",
    },
    { id: 2, action: "Logged In", detail: "Web Session", date: "5 hours ago" },
    {
      id: 3,
      action: "Online Test",
      detail: "Computer Science Chap 1",
      date: "Yesterday",
    },
  ]);

  return (
    <div className="ud-container">
      {/* --- HERO SECTION --- */}
      <div className="ud-hero">
        <div>
          <h2 className="ud-welcome">
            Welcome back, <span className="text-gradient">{user.name}!</span> 👋
          </h2>
          <p className="ud-subtitle">
            Here is what's happening with your account today.
          </p>
        </div>
        <div className="ud-plan-badge">
          {isFree ? (
            <span className="badge-pill free">Free Plan (1 Paper Limit)</span>
          ) : (
            <span className="badge-pill premium">
              <FaCrown /> Premium Member
            </span>
          )}
        </div>
      </div>

      {/* --- STATS & ACTIONS GRID --- */}
      <div className="ud-grid">
        {/* CARD 1: GENERATE PAPER */}
        <div className={`ud-card action-card ${limitReached ? "locked" : ""}`}>
          <div className="card-top">
            <div className="card-icon-bg blue-glow">
              {limitReached ? <FaLock /> : <FaPlus />}
            </div>
            <span className="card-tag">Core Feature</span>
          </div>
          <div className="card-info">
            <h5>Generate Paper</h5>
            <p>Create professional PDF papers.</p>
          </div>

          {limitReached ? (
            <button className="ud-btn btn-locked" disabled>
              Limit Reached (Upgrade)
            </button>
          ) : (
            <Link to="/user/generate-paper" className="ud-btn btn-blue">
              Create Now
            </Link>
          )}
        </div>

        {/* CARD 2: ONLINE TEST */}
        <div className="ud-card action-card">
          <div className="card-top">
            <div className="card-icon-bg purple-glow">
              <FaLaptopCode />
            </div>
            <span className="card-tag">Practice</span>
          </div>
          <div className="card-info">
            <h5>Online Test</h5>
            <p>Attempt MCQs and check result.</p>
          </div>
          <Link to="/user/online-test" className="ud-btn btn-purple">
            Start Quiz
          </Link>
        </div>

        {/* CARD 3: USAGE STATS */}
        <div className="ud-card stats-card">
          <div className="stats-header">
            <span>Paper Usage</span>
            <FaHistory className="text-muted" />
          </div>
          <div className="stats-body">
            <h3 className="stats-number">
              {user.usage.papersGenerated}{" "}
              <span className="total">/ {isFree ? "1" : "∞"}</span>
            </h3>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: isFree
                    ? `${(user.usage.papersGenerated / 1) * 100}%`
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

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div className="ud-section">
        <h4 className="section-title">Recent Activity</h4>
        <div className="activity-table-wrapper">
          <table className="ud-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Details</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id}>
                  <td className="fw-bold">{act.action}</td>
                  <td className="text-muted">{act.detail}</td>
                  <td className="text-sm">
                    <FaClock className="me-1" /> {act.date}
                  </td>
                  <td>
                    <span className="status-badge success">Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
