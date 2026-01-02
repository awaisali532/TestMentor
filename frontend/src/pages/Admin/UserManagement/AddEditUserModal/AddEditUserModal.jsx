import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaSave,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"; // ❌ FaSpinner Removed
import toast from "react-hot-toast";
import "./AddEditUserModal.css";

// ✅ Import TMLoader
import TMLoader from "../../../../components/common/TMLoader/TMLoader";

// Permission List (Only relevant for Admins)
const PERMISSION_LIST = [
  { id: "manage_questions", label: "Question Manager" },
  { id: "manage_subjects", label: "Manage Subjects" },
  { id: "manage_users", label: "User Management" },
];

const AddEditUserModal = ({ show, onClose, onSave, editingUser, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin", // Default to Admin since we only create admins here
    permissions: [],
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);

    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role, // Could be 'user' if editing a normal user
        permissions: editingUser.permissions || [],
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "admin", // Force new creations to be Admin
        permissions: [],
      });
    }
  }, [editingUser, show]);

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const currentPerms = prev.permissions;
      if (currentPerms.includes(permId)) {
        return {
          ...prev,
          permissions: currentPerms.filter((id) => id !== permId),
        };
      } else {
        return { ...prev, permissions: [...currentPerms, permId] };
      }
    });
  };

  const validateForm = () => {
    const { name, email, password } = formData;
    if (!name.trim()) return "Full Name is required.";
    if (!email.trim()) return "Email Address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid Email Address format.";

    if (!editingUser || password.trim() !== "") {
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(password))
        return "Password must contain at least 1 Uppercase Letter.";
      if (!/[0-9]/.test(password))
        return "Password must contain at least 1 Number.";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        return "Password must contain at least 1 Special Character (!@#$).";
    }
    return null;
  };

  const handleSaveClick = () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    onSave(formData);
  };

  if (!show) return null;

  return (
    <>
      {/* ✅ Show TMLoader if saving */}
      {loading && <TMLoader />}

      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h5 className="m-0 fw-bold text-main">
              {editingUser ? "Edit User / Admin" : "Create New Admin"}
            </h5>
            <button className="btn-close-modal" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="modal-body custom-scrollbar">
            {/* Name */}
            <div className="mb-3">
              <label>Full Name</label>
              <input
                type="text"
                className="modal-input"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label>Email Address</label>
              <input
                type="email"
                className="modal-input"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Role Selection */}
            <div className="mb-3">
              <label>Role</label>
              <select
                className="modal-input"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                disabled={!editingUser} // Lock to Admin when creating new
              >
                {/* If editing, allow changing role. If creating, force Admin. */}
                {!editingUser ? (
                  <option value="admin">Admin (Staff)</option>
                ) : (
                  <>
                    <option value="user">User (Standard)</option>
                    <option value="admin">Admin (Staff)</option>
                  </>
                )}
              </select>
              {!editingUser && (
                <small className="text-muted d-block mt-1">
                  * Only Admins can be created here. Regular users must sign up.
                </small>
              )}
            </div>

            {/* Permissions (Only for Admin Role) */}
            {formData.role === "admin" && (
              <div className="mb-4">
                <label className="d-flex align-items-center gap-2 mb-2 text-accent">
                  <FaShieldAlt /> Assign Permissions
                </label>
                <div className="permissions-box">
                  {PERMISSION_LIST.map((perm) => (
                    <div key={perm.id} className="permission-item">
                      <input
                        type="checkbox"
                        id={perm.id}
                        className="form-check-input custom-check"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <label htmlFor={perm.id} className="perm-label">
                        {perm.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="mb-4">
              <label>
                {editingUser ? "New Password (Optional)" : "Password"}
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className="modal-input"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingUser
                      ? "Leave empty to keep current"
                      : "Enter strong password"
                  }
                  style={{ paddingRight: "40px" }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    cursor: "pointer",
                    color: "#6c757d",
                    fontSize: "1.1rem",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button
              className="btn-save w-100"
              onClick={handleSaveClick}
              disabled={loading}
            >
              {/* Spinner Removed, Text remains */}
              <FaSave className="me-2" />{" "}
              {editingUser ? "Update User" : "Create Admin"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEditUserModal;
