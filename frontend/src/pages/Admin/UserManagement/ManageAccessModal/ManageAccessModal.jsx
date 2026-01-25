import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCrown,
  FaHistory,
  FaCalendarAlt,
  FaEdit, // Icon for custom limit
} from "react-icons/fa";
import toast from "react-hot-toast"; // ✅ Toast Import zaroori hai
import "./ManageAccessModal.css";

const ManageAccessModal = ({
  show,
  onClose,
  user,
  onSavePlan,
  onResetLimits,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState("plan");
  const today = new Date().toISOString().split("T")[0];
  // Plan State
  const [planData, setPlanData] = useState({
    planType: "free",
    validUntil: "",
  });

  // Limits State
  const [limitData, setLimitData] = useState({
    papersGenerated: 0,
    onlineTestsTaken: 0,
    customPaperLimit: "", // ✅ New State for Custom Limit
  });

  useEffect(() => {
    if (user) {
      // Setup Plan Data
      const validDate = user.subscription?.validUntil
        ? new Date(user.subscription.validUntil).toISOString().split("T")[0]
        : "";

      setPlanData({
        planType: user.planType || "free",
        validUntil: validDate,
      });

      // Setup Limit Data
      setLimitData({
        papersGenerated: user.usage?.papersGenerated || 0,
        onlineTestsTaken: user.usage?.onlineTestsTaken || 0,
        // ✅ Agar custom limit database me hai to wo dikhao, warna empty
        customPaperLimit: user.usage?.customPaperLimit ?? "",
      });
    }
  }, [user, show]);

  const handleSavePlan = () => {
    // 🔒 PROBLEM 1 SOLVED: Validation Logic
    if (planData.planType === "paid" && !planData.validUntil) {
      return toast.error("Please select an Expiry Date for the Premium Plan!");
    }
    onSavePlan(user._id, planData);
  };

  const handleSaveLimits = () => {
    // Empty string ko null bhejo taake default logic chale
    const payload = {
      ...limitData,
      customPaperLimit:
        limitData.customPaperLimit === ""
          ? null
          : parseInt(limitData.customPaperLimit),
    };
    onResetLimits(user._id, payload);
  };

  if (!show || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container access-modal">
        <div className="modal-header">
          <h5 className="m-0 fw-bold text-main">
            Manage Access: <span className="text-accent">{user.name}</span>
          </h5>
          <button className="btn-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* TABS */}
        <div className="access-tabs">
          <button
            className={`tab-btn ${activeTab === "plan" ? "active" : ""}`}
            onClick={() => setActiveTab("plan")}
          >
            <FaCrown className="me-2" /> Subscription
          </button>
          <button
            className={`tab-btn ${activeTab === "limits" ? "active" : ""}`}
            onClick={() => setActiveTab("limits")}
          >
            <FaHistory className="me-2" /> Usage Limits
          </button>
        </div>

        <div className="modal-body">
          {/* --- PLAN TAB --- */}
          {activeTab === "plan" && (
            <div className="animate-fade-in">
              <div className="mb-3">
                <label>Plan Type</label>
                <select
                  className="modal-input"
                  value={planData.planType}
                  onChange={(e) =>
                    setPlanData({ ...planData, planType: e.target.value })
                  }
                >
                  <option value="free">Free Plan</option>
                  <option value="paid">Premium / Paid</option>
                </select>
              </div>

              {planData.planType === "paid" && (
                <div className="mb-4">
                  <label className="d-flex align-items-center gap-2">
                    <FaCalendarAlt /> Expiry Date{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="modal-input"
                    value={planData.validUntil}
                    required // HTML Validation
                    onChange={(e) =>
                      setPlanData({ ...planData, validUntil: e.target.value })
                    }
                    min={today}
                  />
                  <small className="text-muted">
                    User will revert to Free after this date.
                  </small>
                </div>
              )}

              <button
                className="btn-save w-100"
                onClick={handleSavePlan}
                disabled={loading}
              >
                Update Plan
              </button>
            </div>
          )}

          {/* --- LIMITS TAB (Updated) --- */}
          {activeTab === "limits" && (
            <div className="animate-fade-in">
              <div className="alert-box mb-3">
                <small>
                  Default System Limit: <b>5 Papers</b>
                </small>
              </div>

              {/* ✅ NEW: Custom Limit Input */}
              <div className="mb-3">
                <label className="d-flex align-items-center gap-2">
                  <FaEdit /> Set Custom Limit (Optional)
                </label>
                <input
                  type="number"
                  className="modal-input"
                  placeholder="Leave empty for default (5)"
                  value={limitData.customPaperLimit}
                  onChange={(e) =>
                    setLimitData({
                      ...limitData,
                      customPaperLimit: e.target.value, // Keep as string for better UX (empty state)
                    })
                  }
                />
                <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Enter a number (e.g., 10) to override default limit for this
                  user only.
                </small>
              </div>

              <hr style={{ opacity: 0.1, margin: "15px 0" }} />

              <div className="row">
                <div className="col-6 mb-3">
                  <label>Papers Used</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={limitData.papersGenerated}
                    onChange={(e) =>
                      setLimitData({
                        ...limitData,
                        papersGenerated: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-6 mb-3">
                  <label>Tests Taken</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={limitData.onlineTestsTaken}
                    onChange={(e) =>
                      setLimitData({
                        ...limitData,
                        onlineTestsTaken: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-2">
                <button
                  className="btn-secondary w-50"
                  onClick={() =>
                    setLimitData({
                      ...limitData,
                      papersGenerated: 0,
                      onlineTestsTaken: 0,
                    })
                  }
                >
                  Reset Counts
                </button>
                <button
                  className="btn-save w-50"
                  onClick={handleSaveLimits}
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccessModal;
