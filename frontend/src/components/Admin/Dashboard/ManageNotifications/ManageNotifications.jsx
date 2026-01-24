import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // ✅ Toast Import
import { FaTrash } from "react-icons/fa";
import "./ManageNotifications.css";

// ✅ Import Custom Confirmation Modal (Path adjust karein agar zaroorat ho)
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

  // ✅ Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
  });

  // Fetch Notifications
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

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Notification
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
      toast.success("Notification Added Successfully!"); // ✅ Success Toast
    } catch (err) {
      toast.error("Failed to add notification"); // ✅ Error Toast
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 1: Delete Button Click Handler (Sirf Modal kholega)
  const handleDeleteClick = (id) => {
    setDeleteModal({
      isOpen: true,
      id: id,
    });
  };

  // ✅ Step 2: Confirm Delete Handler (Actual API Call)
  const confirmDelete = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${BASE_URL}/api/notifications/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Notification Deleted!"); // ✅ Success Toast
      fetchNotifications();
    } catch (err) {
      toast.error("Error deleting notification");
    } finally {
      // Close Modal
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="admin-notify-container">
      {/* ✅ Toaster for Alerts */}
      <Toaster position="top-right" />

      {/* ✅ Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Notification?"
        message="Are you sure you want to verify this deletion? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      <h2>Manage Notifications</h2>

      <div className="notify-grid">
        {/* LEFT: FORM */}
        <div className="notify-form-card">
          <h4>Add New Alert</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Message (English)</label>
              <textarea
                name="messageEn"
                value={formData.messageEn}
                onChange={handleChange}
                required
                placeholder="e.g. New data uploaded"
              />
            </div>

            <div className="form-group">
              <label>Message (Urdu)</label>
              <textarea
                name="messageUr"
                value={formData.messageUr}
                onChange={handleChange}
                required
                placeholder="مثال: نیا ڈیٹا اپلوڈ ہو گیا ہے"
                className="rtl-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="urgent">Urgent (Red)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Audience</label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                >
                  <option value="all">All Users</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-add" disabled={loading}>
              {loading ? "Posting..." : "Post Notification"}
            </button>
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="notify-list-card custom-scrollbar">
          <h4>Active Alerts</h4>
          {notifications.length === 0 ? (
            <p>No notifications active.</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} className={`admin-notif-item ${notif.type}`}>
                <div className="notif-content">
                  <p className="en-text">{notif.messageEn}</p>
                  <p className="ur-text">{notif.messageUr}</p>
                  <small>
                    {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                    {notif.targetAudience.toUpperCase()}
                  </small>
                </div>
                <button
                  className="btn-delete"
                  // ✅ Yahan ab direct delete nahi, balkay modal open hoga
                  onClick={() => handleDeleteClick(notif._id)}
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
