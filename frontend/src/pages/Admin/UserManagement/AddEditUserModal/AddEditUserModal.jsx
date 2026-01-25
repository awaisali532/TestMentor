import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaSave,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import TMLoader from "../../../../components/common/TMLoader/TMLoader";
import "./AddEditUserModal.css";

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
    role: "user",
    permissions: [],
    planType: "free",
    isVerified: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        permissions: editingUser.permissions || [],
        planType: editingUser.planType || "free",
        isVerified: editingUser.isVerified,
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        permissions: [],
        planType: "free",
        isVerified: true,
      });
    }
  }, [editingUser, show]);

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const currentPerms = prev.permissions;
      return currentPerms.includes(permId)
        ? { ...prev, permissions: currentPerms.filter((id) => id !== permId) }
        : { ...prev, permissions: [...currentPerms, permId] };
    });
  };

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const { name, email, password } = formData;

    // 1. Basic Empty Checks
    if (!name.trim()) return "Full Name is required.";
    if (!email.trim()) return "Email Address is required.";

    // 2. Strict Gmail Validation (Ends with @gmail.com)
    // Regex ensures strict matching for @gmail.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return "Only @gmail.com email addresses are allowed.";
    }

    // 3. Password Validation
    // Validate ONLY IF: Creating New User OR Editing and user typed a new password
    if (!editingUser || password.trim() !== "") {
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(password))
        return "Password must contain at least 1 Uppercase Letter.";
      if (!/[0-9]/.test(password))
        return "Password must contain at least 1 Number.";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        return "Password must contain at least 1 Special Character (!@#$).";
    }

    return null; // No errors
  };

  const handleSaveClick = () => {
    // Call Validation
    const error = validateForm();
    if (error) {
      return toast.error(error);
    }

    // If valid, proceed
    onSave(formData);
  };

  if (!show) return null;

  return (
    <>
      {loading && <TMLoader />}
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h5 className="m-0 fw-bold text-main">
              {editingUser ? "Edit User" : "Create User"}
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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label>Email Address</label>
              <input
                type="email"
                className="modal-input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@gmail.com"
              />
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                * Must be a valid @gmail.com address
              </small>
            </div>

            {/* Role & Plan Row */}
            <div className="row">
              <div className="col-6 mb-3">
                <label>Role</label>
                <select
                  className="modal-input"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="col-6 mb-3">
                <label>Initial Plan</label>
                <select
                  className="modal-input"
                  value={formData.planType}
                  onChange={(e) =>
                    setFormData({ ...formData, planType: e.target.value })
                  }
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Verified Checkbox */}
            <div className="mb-3 d-flex align-items-center gap-2 p-2 border rounded bg-light">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData({ ...formData, isVerified: e.target.checked })
                }
                id="verifyCheck"
                style={{ width: "18px", height: "18px" }}
              />
              <label
                htmlFor="verifyCheck"
                className="m-0 text-dark"
                style={{ cursor: "pointer", textTransform: "none" }}
              >
                Mark as Verified Account
              </label>
            </div>

            {/* Permissions (Only visible if Role is Admin) */}
            {formData.role === "admin" && (
              <div className="mb-4">
                <label className="text-accent">
                  <FaShieldAlt /> Permissions
                </label>
                <div className="permissions-box">
                  {PERMISSION_LIST.map((perm) => (
                    <div key={perm.id} className="permission-item">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="custom-check"
                      />
                      <span className="ms-2">{perm.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="mb-4">
              <label>Password</label>
              <div className="position-relative d-flex align-items-center">
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
                      : "Min 8 chars, 1 Upper, 1 Special"
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
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                * 8+ chars, 1 Uppercase, 1 Number, 1 Symbol
              </small>
            </div>

            <button
              className="btn-save w-100"
              onClick={handleSaveClick}
              disabled={loading}
            >
              <FaSave className="me-2" /> Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEditUserModal;
