import React, { useState, useEffect } from "react";
import axios from "axios";
// ✅ 1. Re-added { Toaster } to imports
import toast, { Toaster } from "react-hot-toast";
import {
  FaCamera,
  FaPen,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaSpinner,
  FaTrash,
  FaFilePdf,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaIdBadge,
} from "react-icons/fa";
import "./ProfileSettings.css";

const ProfileSettings = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATES ---
  const [user, setUser] = useState({
    name: "",
    email: "",
    image: "",
    resume: "",
    isSuperAdmin: false,
  });

  // Loaders
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Modals & Inputs
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setNewName(storedUser.name);
    }
  }, []);

  const getViewableResumeLink = (url) => url || "#";

  // --- 2. IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Invalid Image");

    const formData = new FormData();
    formData.append("image", file);
    setImgLoading(true);
    const toastId = toast.loading("Uploading photo...");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Photo updated!", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload", { id: toastId });
    } finally {
      setImgLoading(false);
    }
  };

  // --- 3. REMOVE IMAGE ---
  const handleRemoveImage = async () => {
    if (!window.confirm("Remove photo?")) return;
    setImgLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/users/profile/remove-image`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Photo removed");
    } catch (err) {
      toast.error("Failed");
    } finally {
      setImgLoading(false);
    }
  };

  // --- 4. UPDATE NAME ---
  const handleUpdateName = async () => {
    if (!newName.trim()) return toast.error("Name empty");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/users/profile`,
        { name: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Name updated!");
      setShowNameModal(false);
    } catch (err) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. CHANGE PASSWORD ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm)
      return toast.error("Passwords don't match");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/users/change-password`,
        { oldPassword: passwords.old, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed!");
      setShowPassModal(false);
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- 6. RESUME UPLOAD ---
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf")
      return toast.error("Upload valid PDF");

    const formData = new FormData();
    formData.append("resume", file);
    setResumeLoading(true);
    const toastId = toast.loading("Uploading Resume...");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/users/profile/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const updatedUser = { ...user, resume: res.data.resume };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Uploaded successfully!", { id: toastId });
    } catch (err) {
      toast.error("Upload failed", { id: toastId });
    } finally {
      setResumeLoading(false);
    }
  };

  // --- 7. DELETE RESUME ---
  const handleDeleteResume = async () => {
    if (!window.confirm("Delete resume?")) return;
    setResumeLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/users/profile/resume/remove`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedUser = { ...user, resume: "" };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Resume removed");
    } catch (err) {
      toast.error("Failed");
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="profile-wrapper d-flex justify-content-center align-items-center">
      {/* ✅ 2. Re-added Toaster Component Here */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="card profile-card border-0">
        <div className="card-body text-center p-4 p-md-5">
          <h4 className="fw-bold mb-4 gradient-text">Profile Settings</h4>

          {/* === AVATAR SECTION === */}
          <div className="position-relative d-inline-block mb-4">
            <div
              className={`avatar-container ${
                imgLoading ? "loading-border" : ""
              }`}
            >
              {imgLoading ? (
                <div className="avatar-loading-overlay">
                  <FaSpinner className="icon-spin-lg" />
                  <span className="mt-2 text-xs fw-bold">Updating...</span>
                </div>
              ) : user.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="avatar-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    setUser((p) => ({ ...p, image: "" }));
                  }}
                />
              ) : (
                <FaUser className="default-avatar-icon" />
              )}
            </div>

            {/* AVATAR ACTION BUTTONS (Camera & Trash) */}
            {!imgLoading && (
              <div className="avatar-actions">
                <label
                  className="avatar-btn btn-camera shadow"
                  title="Upload Photo"
                >
                  <FaCamera size={14} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                {user.image && (
                  <button
                    className="avatar-btn btn-trash shadow"
                    onClick={handleRemoveImage}
                    title="Remove Photo"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* === NAME (With Spaced Edit Button) === */}
          <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
            <h3 className="fw-bold m-0 text-main">{user.name}</h3>
            <button
              className="edit-name-btn shadow-sm"
              onClick={() => setShowNameModal(true)}
            >
              <FaPen size={11} />
            </button>
          </div>

          <span
            className={`badge-custom mb-4 ${
              user.isSuperAdmin ? "badge-admin" : "badge-sub"
            }`}
          >
            <FaIdBadge className="me-1" />{" "}
            {user.isSuperAdmin ? "Super Admin" : "Sub-Admin"}
          </span>

          {/* === EMAIL === */}
          <div className="info-box mb-3">
            <label className="info-label">Email Address</label>
            <div className="d-flex justify-content-between align-items-center">
              <span className="info-value">{user.email}</span>
              <span className="badge-locked">LOCKED</span>
            </div>
          </div>

          {/* === PASSWORD === */}
          <div className="info-box mb-3">
            <label className="info-label">Security</label>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="info-value ls-2">••••••••</span>
                <small className="d-block text-muted text-xs">
                  Password hidden
                </small>
              </div>
              <button
                className="btn-outline-custom"
                onClick={() => setShowPassModal(true)}
              >
                Change
              </button>
            </div>
          </div>

          {/* === RESUME SECTION (Super Admin Only) === */}
          {user.isSuperAdmin && (
            <div className="info-box">
              <label className="info-label d-flex align-items-center gap-2">
                <FaFilePdf className="text-red-500" /> Admin Resume
              </label>
              <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                {user.resume ? (
                  <a
                    href={getViewableResumeLink(user.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    View Current Resume <FaExternalLinkAlt size={10} />
                  </a>
                ) : (
                  <small className="text-muted fst-italic">
                    No resume uploaded
                  </small>
                )}

                <div className="d-flex gap-2">
                  {/* Modern Upload Button */}
                  <label className="btn-modern-upload cursor-pointer d-flex align-items-center gap-2">
                    {resumeLoading ? (
                      <FaSpinner className="icon-spin" />
                    ) : (
                      <>
                        <FaCloudUploadAlt />{" "}
                        {user.resume ? "Replace" : "Upload"}
                      </>
                    )}
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      onChange={handleResumeUpload}
                      disabled={resumeLoading}
                    />
                  </label>

                  {/* Modern Delete Button */}
                  {user.resume && (
                    <button
                      className="btn-modern-delete"
                      onClick={handleDeleteResume}
                      disabled={resumeLoading}
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS (Name & Pass) --- */}
      {showNameModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box-custom">
            <h5 className="fw-bold mb-3 text-main">Update Name</h5>
            <input
              type="text"
              className="modal-input mb-4"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-modal-save"
                onClick={handleUpdateName}
                disabled={loading}
              >
                {loading ? <FaSpinner className="icon-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPassModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box-custom">
            <div className="d-flex justify-content-between mb-4 align-items-center">
              <h5 className="fw-bold m-0 d-flex align-items-center text-main">
                <FaLock className="me-2 text-warning" /> Change Password
              </h5>
              <button
                className="btn-close-custom"
                onClick={() => setShowPassModal(false)}
              >
                X
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="modal-label">Current Password</label>
                <input
                  type="password"
                  class="modal-input"
                  required
                  value={passwords.old}
                  onChange={(e) =>
                    setPasswords({ ...passwords, old: e.target.value })
                  }
                />
              </div>
              <div className="mb-3 position-relative">
                <label className="modal-label">New Password</label>
                <input
                  type={showPass ? "text" : "password"}
                  className="modal-input"
                  required
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                />
                <span
                  className="password-eye"
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="mb-4">
                <label className="modal-label">Confirm New Password</label>
                <input
                  type="password"
                  className="modal-input"
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                />
              </div>
              <button
                className="btn-modal-save w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
