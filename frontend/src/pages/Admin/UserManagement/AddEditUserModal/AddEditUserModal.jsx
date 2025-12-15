import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaSpinner,
  FaSave,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"; // ✅ Added Eye Icons
import toast from "react-hot-toast";
import "./AddEditUserModal.css";

// Permission List
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
    role: "student",
    permissions: [],
  });

  // ✅ State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Reset password visibility when modal opens/changes
    setShowPassword(false);

    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        permissions: editingUser.permissions || [],
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
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

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const { name, email, password } = formData;

    // 1. Basic Checks
    if (!name.trim()) return "Full Name is required.";
    if (!email.trim()) return "Email Address is required.";

    // 2. Email Format Check (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid Email Address format.";

    // 3. Password Validation
    if (!editingUser || password.trim() !== "") {
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(password))
        return "Password must contain at least 1 Uppercase Letter.";
      if (!/[0-9]/.test(password))
        return "Password must contain at least 1 Number.";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        return "Password must contain at least 1 Special Character (!@#$).";
    }

    return null; // No Error
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
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h5 className="m-0 fw-bold text-main">
            {editingUser ? "Edit User" : "Add New User"}
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
              placeholder="e.g. Ali Khan"
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
              placeholder="e.g. ali@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label>Role</label>
            <select
              className="modal-input"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Permissions (Admin Only) */}
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

          {/* Password Field with Eye Icon */}
          <div className="mb-4">
            <label>
              {editingUser ? "New Password (Optional)" : "Password"}
            </label>

            {/* Wrapper for Input + Icon */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                // Toggle type between text and password
                type={showPassword ? "text" : "password"}
                className="modal-input"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingUser
                    ? "Leave empty to keep current"
                    : "Enter a strong password"
                }
                style={{ paddingRight: "40px" }} // Make room for the icon
              />

              {/* Eye Icon Clickable */}
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

            {/* Password Hint */}
            {!editingUser && (
              <small
                className="text-muted d-block mt-1"
                style={{ fontSize: "0.75rem" }}
              >
                * Min 8 chars, 1 Uppercase, 1 Number, 1 Special Char.
              </small>
            )}
          </div>

          {/* Save Button */}
          <button
            className="btn-save w-100"
            onClick={handleSaveClick}
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="icon-spin" />
            ) : (
              <>
                <FaSave className="me-2" /> Save User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditUserModal;
