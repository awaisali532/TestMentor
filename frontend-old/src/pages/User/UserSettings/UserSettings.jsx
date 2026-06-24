import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../../utils/cropUtils";

import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCrown,
  FaHistory,
  FaSave,
  FaEdit,
  FaTrash,
  FaUniversity,
  FaMapMarkerAlt,
  FaPhone,
  FaBuilding,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import "./UserSettings.css";

// ✅ 1. IMPORT TMLOADER
import TMLoader from "../../../components/common/TMLoader/TMLoader";

// ✅ 2. IMPORT AVATARS
import BoyAvatar from "../../../assets/imeages/Avatar/boy.jpg";
import GirlAvatar from "../../../assets/imeages/Avatar/girl.svg";

const UserSettings = () => {
  const { user, setUser } = useUser();

  // ✅ Single Loader Logic for UI
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [instLogoLoading, setInstLogoLoading] = useState(false);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Cropper States
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [institute, setInstitute] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setInstitute({
        name: user.institute?.name || "",
        address: user.institute?.address || "",
        phone: user.institute?.phone || "",
      });
    }
  }, [user]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Lifetime";

  // =========================================================
  // 📸 PROFILE IMAGE LOGIC
  // =========================================================
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result.toString());
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropAndUpload = async () => {
    try {
      setShowCropModal(false);
      setImgLoading(true); // Triggers TMLoader

      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("image", croppedImageBlob);

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUser = { ...user, image: res.data.image };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setImgLoading(false);
      setImageSrc(null);
    }
  };

  const renderProfileImage = () => {
    if (user.image) {
      return <img src={user.image} alt="Profile" className="us-avatar-img" />;
    }

    const gender = user.gender ? user.gender.trim().toLowerCase() : "unknown";

    if (gender === "male") {
      return <img src={BoyAvatar} alt="Boy" className="us-avatar-img" />;
    } else if (gender === "female") {
      return <img src={GirlAvatar} alt="Girl" className="us-avatar-img" />;
    }

    return (
      <div className="us-avatar-placeholder">
        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
      </div>
    );
  };

  // =========================================================
  // 🏛️ INSTITUTE LOGO
  // =========================================================
  const handleInstLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    setInstLogoLoading(true); // Triggers TMLoader

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/institute/logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUser = {
        ...user,
        institute: { ...user.institute, logo: res.data.logo },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Logo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setInstLogoLoading(false);
    }
  };

  // =========================================================
  // OTHER ACTIONS
  // =========================================================
  const handleDeleteClick = (target) => {
    setDeleteTarget(target);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    if (deleteTarget === "profile") setImgLoading(true);
    else setInstLogoLoading(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint =
        deleteTarget === "profile" ? "profile/image" : "institute/logo";

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${endpoint}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      let updatedUser = { ...user };
      if (deleteTarget === "profile") updatedUser.image = "";
      else updatedUser.institute.logo = "";

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(
        `${deleteTarget === "profile" ? "Photo" : "Logo"} removed!`,
      );
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setImgLoading(false);
      setInstLogoLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    setLoading(true); // Triggers TMLoader
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updatedUser = { ...user, name: res.data.name || name };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile details updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstitute = async (e) => {
    e.preventDefault();
    setLoading(true); // Triggers TMLoader
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/institute/info`,
        institute,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updatedUser = {
        ...user,
        institute: { ...user.institute, ...res.data.institute },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Institute details updated!");
    } catch (err) {
      toast.error("Failed to update institute info");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm)
      return toast.error("New passwords do not match!");
    if (passwords.new.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true); // Triggers TMLoader
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/change-password`,
        { oldPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUBSCRIPTION CALCULATIONS
  const isPaid = user?.planType === "paid" || user?.planType === "premium";
  const papersUsed = user?.usage?.papersGenerated || 0;
  // If Free: Limit is 1 (or custom), If Paid: Limit is Infinity
  const paperLimit = isPaid ? Infinity : user?.usage?.customPaperLimit || 1;

  // Calculate Percentage for Bar
  const progressPercent = isPaid
    ? 100 // Full Green bar for paid
    : Math.min((papersUsed / paperLimit) * 100, 100);

  if (!user) return <div className="text-center p-5">Loading...</div>;

  return (
    <>
      {/* ✅ 1. TM LOADER (Global for this page) */}
      {(loading || imgLoading || instLogoLoading) && <TMLoader />}

      <div className="us-container">
        <h2 className="us-page-title">Account Settings</h2>

        <div className="us-grid-layout">
          {/* --- LEFT COLUMN --- */}
          <div className="us-left-col">
            <div className="us-card profile-card">
              <div className="us-avatar-wrapper">
                {renderProfileImage()}

                <label className="us-camera-btn" title="Upload Photo">
                  <FaCamera />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </label>

                {user.image && (
                  <button
                    className="us-delete-btn"
                    onClick={() => handleDeleteClick("profile")}
                    title="Remove Photo"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
              </div>

              <h3 className="us-profile-name">{user.name}</h3>
              <p className="us-profile-email">{user.email}</p>

              <div className={`us-plan-badge ${user.planType}`}>
                {isPaid ? <FaCrown /> : <FaUser />}
                {isPaid ? "Premium Member" : "Free Plan"}
              </div>
            </div>

            {/* ✅ 2. UPDATED SUBSCRIPTION DETAILS */}
            <div className="us-card sub-card">
              <div className="us-card-header">
                <FaHistory className="text-accent" />
                <h5>Subscription Details</h5>
              </div>
              <div className="us-sub-details">
                <div className="detail-row">
                  <span>Current Plan:</span>
                  <span
                    className={
                      isPaid ? "text-gold fw-bold" : "text-muted fw-bold"
                    }
                  >
                    {isPaid ? "PREMIUM" : "FREE"}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Valid Until:</span>
                  <span>
                    {isPaid
                      ? formatDate(user.subscription?.validUntil)
                      : "Lifetime"}
                  </span>
                </div>

                <div className="usage-bar-wrap">
                  <div className="d-flex justify-content-between text-xs mb-1">
                    <span>Paper Limit</span>
                    <span>
                      {papersUsed} / {isPaid ? "∞" : paperLimit}
                    </span>
                  </div>
                  <div className="progress-bg">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background: isPaid
                          ? "#10b981"
                          : papersUsed >= paperLimit
                            ? "#ef4444"
                            : "#10b981",
                      }}
                    ></div>
                  </div>
                </div>

                {!isPaid && (
                  <button className="btn-us-upgrade">Upgrade to Premium</button>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="us-right-col">
            {/* 1. PERSONAL INFO */}
            <div className="us-card form-card">
              <div className="us-card-header">
                <FaEdit className="text-accent" />
                <h5>Personal Information</h5>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group mb-3">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      className="us-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label>
                    Email Address <span className="badge-locked">Locked</span>
                  </label>
                  <div className="input-with-icon locked">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      className="us-input"
                      value={user.email}
                      disabled
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-us-save"
                  disabled={loading}
                >
                  <FaSave /> Save Personal Info
                </button>
              </form>
            </div>

            {/* 2. INSTITUTE SETTINGS */}
            <div className="us-card form-card">
              <div className="us-card-header">
                <FaUniversity className="text-accent" />
                <h5>Institute Settings</h5>
              </div>

              <div className="inst-logo-section">
                <div className="us-avatar-wrapper inst-logo-wrapper">
                  {/* TMLoader is used instead of internal spinner */}
                  {user.institute?.logo ? (
                    <img
                      src={user.institute.logo}
                      alt="Logo"
                      className="us-avatar-img square"
                    />
                  ) : (
                    <div className="us-avatar-placeholder square">
                      <FaUniversity />
                    </div>
                  )}

                  <label className="us-camera-btn" title="Upload Logo">
                    <FaCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleInstLogoUpload}
                    />
                  </label>

                  {user.institute?.logo && (
                    <button
                      className="us-delete-btn"
                      onClick={() => handleDeleteClick("institute")}
                      title="Remove Logo"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-center text-muted">
                  Institute Logo (Square Recommended)
                </p>
              </div>

              <form onSubmit={handleUpdateInstitute}>
                <div className="form-group mb-3">
                  <label>Institute Name</label>
                  <div className="input-with-icon">
                    <FaBuilding className="input-icon" />
                    <input
                      type="text"
                      className="us-input"
                      placeholder="e.g. Bright Future Academy"
                      value={institute.name}
                      onChange={(e) =>
                        setInstitute({ ...institute, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label>Address</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="input-icon" />
                    <input
                      type="text"
                      className="us-input"
                      placeholder="e.g. Main Boulevard, Lahore"
                      value={institute.address}
                      onChange={(e) =>
                        setInstitute({ ...institute, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <FaPhone className="input-icon" />
                    <input
                      type="text"
                      className="us-input"
                      placeholder="e.g. 0300-1234567"
                      value={institute.phone}
                      onChange={(e) =>
                        setInstitute({ ...institute, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-us-save"
                  disabled={loading}
                >
                  <FaSave /> Save Institute Info
                </button>
              </form>
            </div>

            {/* 3. CHANGE PASSWORD */}
            <div className="us-card form-card">
              <div className="us-card-header">
                <FaLock className="text-accent" />
                <h5>Change Password</h5>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group mb-3">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="us-input"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="us-input"
                      placeholder="New Password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="us-input"
                      placeholder="Confirm New"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-us-outline"
                  disabled={loading}
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CROPPER MODAL */}
      {showCropModal && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-container">
            <div className="modal-header">
              <h5 className="m-0 fw-bold">Adjust Profile Picture</h5>
              <button
                className="btn-close-modal"
                onClick={() => setShowCropModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="crop-controls">
              <label>Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="zoom-range"
              />
              <div className="crop-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowCropModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-save" onClick={handleCropAndUpload}>
                  Set Profile Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-box">
            <h3 className="dm-title">
              Delete {deleteTarget === "profile" ? "Photo" : "Logo"}?
            </h3>
            <p className="dm-msg">
              Are you sure you want to delete your{" "}
              {deleteTarget === "profile" ? "profile photo" : "institute logo"}?
              This action cannot be undone.
            </p>
            <div className="dm-actions">
              <button
                className="dm-btn dm-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="dm-btn dm-confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSettings;
