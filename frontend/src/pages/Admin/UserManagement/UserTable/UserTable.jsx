import React from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaShieldAlt,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./UserTable.css";

const UserTable = ({
  users,
  currentUser,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleVerify,
  onManageAccess,
}) => {
  const isSuperAdmin = (u) =>
    u?.role === "superadmin" || u?.isSuperAdmin === true;
  const currentUserId = currentUser?.id || currentUser?._id;
  const amISuperAdmin = isSuperAdmin(currentUser);

  return (
    <div className="user-table-card">
      <div className="table-responsive">
        <table className="custom-table">
          {/* ✅ FIXED THEAD: Removed comments and spaces between tags */}
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Plan</th>
              <th>Verified</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                const isSelf = currentUserId === user._id;
                const targetIsSuper = isSuperAdmin(user);
                const iAmSubAdmin = !amISuperAdmin;
                const isDisabled = isSelf || (iAmSubAdmin && targetIsSuper);

                let disabledTitle = "";
                if (isSelf) disabledTitle = "You cannot delete/edit yourself";
                else if (iAmSubAdmin && targetIsSuper)
                  disabledTitle = "You cannot remove a Super Admin";

                return (
                  <tr
                    key={user._id}
                    className={isDisabled ? "row-disabled" : ""}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="user-avatar">{user.name.charAt(0)}</div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="user-name">{user.name}</h6>
                            {targetIsSuper && (
                              <FaShieldAlt
                                className="text-warning small"
                                title="Super Admin"
                              />
                            )}
                            {isSelf && (
                              <span className="badge bg-light text-dark border">
                                You
                              </span>
                            )}
                          </div>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge-role ${user.role}`}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {user.planType === "paid" ? (
                        <span className="badge-plan paid">PREMIUM</span>
                      ) : (
                        <span className="badge-plan free">FREE</span>
                      )}
                      <div
                        className="small text-muted mt-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Papers: {user.usage?.papersGenerated || 0}
                      </div>
                    </td>

                    <td>
                      <button
                        className={`verify-toggle ${user.isVerified ? "verified" : "pending"}`}
                        onClick={() => !isDisabled && onToggleVerify(user._id)}
                        disabled={isDisabled}
                        title="Click to Toggle Verification"
                      >
                        {user.isVerified ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>{user.isVerified ? "Verified" : "Pending"}</span>
                      </button>
                    </td>

                    <td>
                      <button
                        className={`status-btn ${user.isActive ? "active" : "inactive"}`}
                        onClick={() => !isDisabled && onToggleStatus(user._id)}
                        disabled={isDisabled}
                      >
                        {user.isActive ? "Active" : "Blocked"}
                      </button>
                    </td>

                    <td className="text-end">
                      <button
                        className="action-btn settings"
                        onClick={() => !isDisabled && onManageAccess(user)}
                        disabled={isDisabled}
                        title="Manage Plan & Limits"
                      >
                        <FaCog />
                      </button>

                      <button
                        className="action-btn edit"
                        onClick={() => !isDisabled && onEdit(user)}
                        disabled={isDisabled}
                        title="Edit Details"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => !isDisabled && onDelete(user._id)}
                        disabled={isDisabled}
                        title="Delete User"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
