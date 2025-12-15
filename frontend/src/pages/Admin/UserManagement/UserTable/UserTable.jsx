import React from "react";
import { FaEdit, FaTrashAlt, FaShieldAlt } from "react-icons/fa";
import "./UserTable.css";

const UserTable = ({
  users,
  currentUser,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  // Helper to check if a user is Super Admin
  const isSuperAdmin = (u) => {
    return u?.role === "superadmin" || u?.isSuperAdmin === true;
  };

  // ✅ Fix: Get the correct ID from currentUser (handles 'id' or '_id')
  const currentUserId = currentUser?.id || currentUser?._id;
  const amISuperAdmin = isSuperAdmin(currentUser);

  return (
    <div className="user-table-card">
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                // --- STRICT PERMISSION LOGIC ---

                // 1. Is this ME? (Compare normalized IDs)
                const isSelf = currentUserId === user._id;

                // 2. Is the target row a Super Admin?
                const targetIsSuper = isSuperAdmin(user);

                // 3. Am I a Sub Admin? (Not a Super Admin)
                const iAmSubAdmin = !amISuperAdmin;

                // --- DISABLE CONDITIONS ---

                // Disable Delete/Status/Edit if:
                // A. It is myself (Self-Protection)
                // B. I am a Sub Admin AND the target is a Super Admin (Hierarchy Protection)
                const isDisabled = isSelf || (iAmSubAdmin && targetIsSuper);

                // Tooltip text for UX
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
                            {/* Shield for Super Admin */}
                            {targetIsSuper && (
                              <FaShieldAlt
                                className="text-warning small"
                                title="Super Admin"
                              />
                            )}
                            {/* "You" Badge */}
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
                      <button
                        className={`status-btn ${
                          user.isActive ? "active" : "inactive"
                        }`}
                        onClick={() => !isDisabled && onToggleStatus(user._id)}
                        disabled={isDisabled}
                        title={disabledTitle}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="text-end">
                      <button
                        className="action-btn edit"
                        onClick={() => !isDisabled && onEdit(user)}
                        disabled={isDisabled}
                        title={isDisabled ? disabledTitle : "Edit"}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => !isDisabled && onDelete(user._id)}
                        disabled={isDisabled}
                        title={isDisabled ? disabledTitle : "Delete"}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-5 text-muted">
                  No users found matching your search.
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
