import React, { useState, useEffect } from "react";
// ✅ Added FaEye and FaEyeSlash
import { FaTimes, FaSave, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const AddEditUserModal = ({ show, onClose, onSave, editingUser, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });

  // ✅ State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (show) {
      if (editingUser) {
        setFormData({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          password: "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          role: "student",
          password: "",
        });
      }
      // Reset visibility when modal opens
      setShowPassword(false);
    }
  }, [show, editingUser]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.endsWith("@gmail.com")) {
      return toast.error("Email must be a valid @gmail.com address!");
    }

    if (!editingUser) {
      const password = formData.password;
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

      if (!passwordRegex.test(password)) {
        return toast.error(
          "Password must include: 8+ chars, 1 Capital, 1 Number, & 1 Special char (!@#$)"
        );
      }
    }

    onSave(formData);
  };

  return (
    <div className="modal-overlay-custom">
      <div className="modal-box">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="m-0 fw-bold">
            {editingUser ? "Edit User" : "Add New User"}
          </h5>
          <button
            className="btn-close"
            onClick={!loading ? onClose : null}
            disabled={loading}
          ></button>
        </div>

        {/* Body */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@gmail.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password Field with Eye Button */}
            {!editingUser && (
              <div className="mb-4">
                <label className="form-label small fw-bold">Password</label>
                <div className="input-group">
                  <input
                    // ✅ Dynamic Type (Text or Password)
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="******"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={loading}
                  />
                  {/* ✅ Toggle Button */}
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="form-text text-muted small">
                  Min 8 chars, 1 Capital, 1 Number, 1 Special Char.
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold d-flex justify-content-center align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="icon-spin me-2" />
                  {editingUser ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  {editingUser ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditUserModal;
