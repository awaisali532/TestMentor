import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import "./ManageNotifications.css";

// Check path according to your project
import ConfirmationModal from "../../../common/ConfirmationModal/ConfirmationModal";

const ManageNotifications = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    messageEn: "",
    messageUr: "",
    type: "info",
    targetAudience: "all",
  });
  const [loading, setLoading] = useState(false);

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
  });

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(`${BASE_URL}/api/notifications`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      setFormData({
        messageEn: "",
        messageUr: "",
        type: "info",
        targetAudience: "all",
      });
      toast.success("Notification Added Successfully!");
    } catch (err) {
      toast.error("Failed to add notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id: id });
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${BASE_URL}/api/notifications/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Notification Deleted!");
      fetchNotifications();
    } catch (err) {
      toast.error("Error deleting notification");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="admin-notify-container">
      <Toaster position="top-right" />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Notification?"
        message="Are you sure? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      <h5 className="mb-3 fw-bold text-main">Manage Notifications</h5>

      <div className="notify-grid">
        {/* LEFT: FORM (Updated with form-card) */}
        <div className="form-card p-3">
          <h6 className="fw-bold text-accent mb-3">Add New Alert</h6>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-main small fw-bold">
                Message (English)
              </label>
              <textarea
                name="messageEn"
                className="form-control custom-input"
                value={formData.messageEn}
                onChange={handleChange}
                required
                placeholder="e.g. New data uploaded"
                rows="2"
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-main small fw-bold">
                Message (Urdu)
              </label>
              <textarea
                name="messageUr"
                className="form-control custom-input urdu-font"
                value={formData.messageUr}
                onChange={handleChange}
                required
                placeholder="مثال: نیا ڈیٹا اپلوڈ ہو گیا ہے"
                rows="2"
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label text-main small fw-bold">
                  Type
                </label>
                <select
                  name="type"
                  className="form-select custom-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="urgent">Urgent (Red)</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label text-main small fw-bold">
                  Audience
                </label>
                <select
                  name="targetAudience"
                  className="form-select custom-select"
                  value={formData.targetAudience}
                  onChange={handleChange}
                >
                  <option value="all">All Users</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-gradient w-100"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Notification"}
            </button>
          </form>
        </div>

        {/* RIGHT: LIST (Updated with form-card) */}
        <div
          className="form-card p-3 custom-scrollbar"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <h6 className="fw-bold text-accent mb-3">Active Alerts</h6>
          {notifications.length === 0 ? (
            <div className="empty-state-box">No notifications active.</div>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} className={`admin-notif-item ${notif.type}`}>
                <div className="notif-content">
                  <p className="en-text m-0">{notif.messageEn}</p>
                  <p className="ur-text m-0 mt-1">{notif.messageUr}</p>
                  <small className="d-block mt-1 text-muted">
                    {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                    <strong>{notif.targetAudience.toUpperCase()}</strong>
                  </small>
                </div>
                {/* Updated Delete Button Style */}
                <button
                  className="btn-icon delete"
                  onClick={() => handleDeleteClick(notif._id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageNotifications;
