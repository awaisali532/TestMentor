import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
    // 1. LocalStorage se data uthao
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setNewName(storedUser.name);
    }

    // 2. (Optional but Recommended) Server se latest data fetch kro
    // Taake agar LocalStorage purana ho to update ho jaye
    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Hum "updateProfile" wale route ko "GET" ki tarah use nahi kr skte,
        // lekin agar aapke pas "GET /me" ya "GET /profile" route ho to yahan call krein.
        // Filhal hum LocalStorage par hi rely kr rhe hain.
      } catch (error) {
        console.error(error);
      }
    };
    fetchLatestProfile();
  }, []);

  // Simplified Helper
  const getViewableResumeLink = (url) => {
    return url || "#";
  };

  // --- 2. IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Invalid Image");

    const formData = new FormData();
    formData.append("image", file);
    setImgLoading(true);
    const toastId = toast.loading("Uploading...");

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

  // ✅ 6. UPLOAD RESUME
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
      console.error(err);
      toast.error("Upload failed", { id: toastId });
    } finally {
      setResumeLoading(false);
    }
  };

  // ✅ 7. DELETE RESUME
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
    <div
      className="container-fluid p-4 d-flex justify-content-center align-items-start"
      style={{ minHeight: "85vh" }}
    >
      <div
        className="card profile-card shadow-sm border-0 w-100"
        style={{ maxWidth: "550px" }}
      >
        <div className="card-body text-center p-4 p-md-5">
          <h4 className="fw-bold mb-4 text-dark">Profile & Settings</h4>

          {/* AVATAR SECTION */}
          <div className="position-relative d-inline-block mb-4">
            <div className="avatar-container">
              {imgLoading ? (
                <div className="spinner-container">
                  <FaSpinner className="icon-spin" />
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
            <div className="d-flex gap-2 justify-content-center mt-3">
              <label
                className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "36px", height: "36px", cursor: "pointer" }}
              >
                <FaCamera size={14} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imgLoading}
                />
              </label>
              {user.image && (
                <button
                  className="btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "36px", height: "36px" }}
                  onClick={handleRemoveImage}
                  disabled={imgLoading}
                >
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>

          {/* NAME */}
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            <h3 className="fw-bold m-0 text-dark">{user.name}</h3>
            <button
              className="edit-name-btn shadow-sm"
              onClick={() => setShowNameModal(true)}
            >
              <FaPen size={13} />
            </button>
          </div>
          <span
            className={`badge px-3 py-2 rounded-pill fw-medium ls-1 mb-4 ${
              user.isSuperAdmin
                ? "bg-primary bg-opacity-10 text-primary"
                : "bg-secondary bg-opacity-10 text-secondary"
            }`}
          >
            {user.isSuperAdmin ? "Super Admin" : "Sub-Admin"}
          </span>

          {/* EMAIL */}
          <div className="bg-light p-3 rounded-3 mb-3 text-start border">
            <label className="fw-bold text-muted mb-1 text-uppercase fs-7 ls-1">
              Email Address
            </label>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-dark fw-medium">{user.email}</span>
              <span className="badge bg-secondary opacity-50 fs-8">LOCKED</span>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="bg-light p-3 rounded-3 mb-3 text-start border">
            <label className="fw-bold text-muted mb-1 text-uppercase fs-7 ls-1">
              Security
            </label>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span
                  className="d-block text-dark fw-bold fs-5 ls-2"
                  style={{ lineHeight: 1 }}
                >
                  ••••••••
                </span>
                <small className="text-muted fs-8">Password hidden</small>
              </div>
              <button
                className="btn btn-outline-dark btn-sm fw-bold px-3 rounded-pill"
                onClick={() => setShowPassModal(true)}
              >
                Change
              </button>
            </div>
          </div>

          {/* ✅ RESUME SECTION */}
          {user.isSuperAdmin && (
            <div className="bg-light p-3 rounded-3 text-start border">
              <label className="fw-bold text-muted mb-1 text-uppercase fs-7 ls-1 d-flex align-items-center gap-2">
                <FaFilePdf className="text-danger" /> Admin Resume
              </label>
              <div className="d-flex justify-content-between align-items-center mt-2">
                {user.resume ? (
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <a
                      href={getViewableResumeLink(user.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-none fw-bold small text-truncate"
                      style={{ maxWidth: "150px" }}
                    >
                      View Current Resume
                    </a>
                    <FaExternalLinkAlt size={12} className="text-primary" />
                  </div>
                ) : (
                  <small className="text-muted fst-italic">
                    No resume uploaded
                  </small>
                )}

                <div className="d-flex gap-2">
                  <label
                    className="btn btn-outline-primary btn-sm fw-bold px-3 rounded-pill d-flex align-items-center gap-2 cursor-pointer"
                    style={{ minWidth: "100px" }}
                  >
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
                  {user.resume && (
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
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

      {/* Modals (Name & Password) */}
      {showNameModal && (
        <div className="modal-overlay-custom">
          <div className="modal-box-custom p-4 bg-white rounded-4 shadow">
            <h5 className="fw-bold mb-3">Update Name</h5>
            <input
              type="text"
              className="form-control mb-4 py-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-light px-4 fw-bold rounded-pill"
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4 fw-bold rounded-pill"
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
          <div className="modal-box-custom p-4 bg-white rounded-4 shadow">
            <div className="d-flex justify-content-between mb-4 align-items-center">
              <h5 className="fw-bold m-0 d-flex align-items-center">
                <FaLock className="me-2 text-warning" /> Change Password
              </h5>
              <button
                className="btn-close"
                onClick={() => setShowPassModal(false)}
              ></button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="small fw-bold text-secondary">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={passwords.old}
                  onChange={(e) =>
                    setPasswords({ ...passwords, old: e.target.value })
                  }
                />
              </div>
              <div className="mb-3 position-relative">
                <label className="small fw-bold text-secondary">
                  New Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className="form-control"
                  required
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer text-muted"
                  style={{ marginTop: "12px" }}
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="mb-4">
                <label className="small fw-bold text-secondary">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                />
              </div>
              <button
                className="btn btn-dark w-100 fw-bold py-2 rounded-pill"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="icon-spin me-2" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
