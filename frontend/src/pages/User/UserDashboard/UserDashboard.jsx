import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ Added Axios
import { FaPlus, FaLaptopCode, FaHistory, FaBookmark } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import DashboardActionCard from "../../../components/DashboardActionCard/DashboardActionCard";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user } = useUser();
  const currentUser = user || { name: "User", usage: { papersGenerated: 0 } };

  // --- STATE FOR SAVED PAPERS COUNT ---
  const [savedCount, setSavedCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- 1. FETCH SAVED PAPERS COUNT ---
  useEffect(() => {
    const fetchPaperCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Hum wahi API use kar rahe hain jo SavedPapers page par ki thi
        const res = await axios.get(`${BASE_URL}/api/papers/my-papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          // Papers ki tadaad (length) set karein
          setSavedCount(res.data.papers.length);
        }
      } catch (error) {
        console.error("Error fetching paper count:", error);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchPaperCount();
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

        {/* 3. ✅ SAVED PAPERS CARD (Count Updated) */}
        <DashboardActionCard
          title="Saved Papers"
          description="Access your previously created papers."
          icon={<FaBookmark />}
          // 👇 YAHAN HUMNE COUNT SHOW KIYA HAI
          tag={loadingCount ? "Loading..." : `${savedCount} Saved`}
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

      {/* --- RECENT ACTIVITY SECTION (Example Data) --- */}
      <div className="ud-section">
        <h4 className="section-title">Recent Activity</h4>
        {/* ... Table code same as before ... */}
      </div>
    </div>
  );
};

export default UserDashboard;
