import React from "react";
import { FaEdit, FaTrashAlt, FaKey } from "react-icons/fa";

const UserTable = ({ users, onEdit, onDelete, onToggleStatus }) => {
  // Helper to get role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "badge bg-danger bg-opacity-10 text-danger";
      case "teacher":
        return "badge bg-primary bg-opacity-10 text-primary";
      default:
        return "badge bg-success bg-opacity-10 text-success";
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="ps-4 py-3 text-uppercase small text-secondary">
                User Profile
              </th>
              <th className="py-3 text-uppercase small text-secondary">Role</th>
              <th className="py-3 text-uppercase small text-secondary">
                Status
              </th>
              <th className="py-3 text-uppercase small text-secondary">
                Joined Date
              </th>
              <th className="pe-4 py-3 text-uppercase small text-secondary text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  {/* Profile Column */}
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                      <div className="user-avatar-circle bg-light text-secondary me-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{user.name}</div>
                        <div className="small text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td>
                    <span className={getRoleBadge(user.role)}>{user.role}</span>
                  </td>

                  {/* Status Toggle (Bootstrap Switch) */}
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={user.isActive}
                        onChange={() => onToggleStatus(user._id)}
                      />
                      <label className="form-check-label small text-muted">
                        {user.isActive ? "Active" : "Banned"}
                      </label>
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="text-muted small">{user.joinedDate}</td>

                  {/* Actions Column */}
                  <td className="pe-4 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-sm btn-light text-warning border"
                        title="Edit"
                        onClick={() => onEdit(user)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-light text-secondary border"
                        title="Reset Password"
                        onClick={() => alert(`Reset password for ${user.name}`)}
                      >
                        <FaKey />
                      </button>
                      <button
                        className="btn btn-sm btn-light text-danger border"
                        title="Delete"
                        onClick={() => onDelete(user._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
