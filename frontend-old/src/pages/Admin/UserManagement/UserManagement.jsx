import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import "./UserManagement.css";

import UserStats from "./UserStats/UserStats";
import UserFilters from "./UserFilters/UserFilters";
import UserTable from "./UserTable/UserTable";
import AddEditUserModal from "./AddEditUserModal/AddEditUserModal";
import ManageAccessModal from "./ManageAccessModal/ManageAccessModal";
import TMLoader from "../../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";

const UserManagement = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const { authLoading, user: currentUser } = useUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Modal State
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessUser, setAccessUser] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    if (!authLoading) fetchUsers();
  }, [authLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // 1. Delete
  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Toggle Block Status
  const handleToggleStatus = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/users/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: !u.isActive } : u)),
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error("Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Toggle Verification
  const handleToggleVerify = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/users/${id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers(
        users.map((u) =>
          u._id === id ? { ...u, isVerified: !u.isVerified } : u,
        ),
      );
      toast.success("Verification status updated");
    } catch (error) {
      toast.error("Verification update failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ 4. NEW: Toggle Practice Mode Directly
  const handleTogglePracticeMode = async (user) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const newStatus = !user.canAccessPracticeMode;

      // Using the existing updateUser API endpoint
      await axios.put(
        `${BASE_URL}/api/users/${user._id}`,
        { canAccessPracticeMode: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers(
        users.map((u) =>
          u._id === user._id ? { ...u, canAccessPracticeMode: newStatus } : u,
        ),
      );
      toast.success(`Practice Mode ${newStatus ? "Allowed" : "Denied"}`);
    } catch (error) {
      toast.error("Failed to update Practice Mode status");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Update Plan
  const handleSavePlan = async (id, planData) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${BASE_URL}/api/users/${id}/plan`,
        planData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state
      setUsers(
        users.map((u) =>
          u._id === id
            ? { ...u, planType: data.planType, subscription: data.subscription }
            : u,
        ),
      );

      toast.success("Plan updated successfully");
      setShowAccessModal(false);
    } catch (error) {
      toast.error("Failed to update plan");
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Reset Limits
  const handleResetLimits = async (id, limitData) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${BASE_URL}/api/users/${id}/limits`,
        limitData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state
      setUsers(
        users.map((u) => (u._id === id ? { ...u, usage: data.usage } : u)),
      );

      toast.success("Limits updated successfully");
      setShowAccessModal(false);
    } catch (error) {
      toast.error("Failed to update limits");
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Save User (Create/Edit)
  const handleSaveUser = async (formData) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingUser) {
        await axios.put(`${BASE_URL}/api/users/${editingUser._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refetch to get updated structure or map manually
        setUsers(
          users.map((u) =>
            u._id === editingUser._id ? { ...u, ...formData } : u,
          ),
        );
        toast.success("User updated");
      } else {
        const { data } = await axios.post(
          `${BASE_URL}/api/users/add`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setUsers([data.user, ...users]);
        toast.success("New user created");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ FILTERING & SORTING (Admins Pinned to Top)
  const filteredUsers = users
    .filter((u) => {
      // 1. Search Logic
      const matchesSearch = (u.name + u.email)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // 2. Role Filter Logic
      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      // 3. Sorting Logic (Pin Admin/SuperAdmin to Top)
      const getPriority = (role) => {
        if (role === "superadmin" || role === "admin") return 1;
        return 0;
      };
      // Higher priority (1) comes first
      return getPriority(b.role) - getPriority(a.role);
    });

  return (
    <div className="user-wrapper">
      <Toaster position="top-right" />
      {(loading || authLoading || actionLoading) && <TMLoader />}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User?"
        message="Permanently delete this user?"
        confirmText="Delete"
        isDanger={true}
      />

      <ManageAccessModal
        show={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        user={accessUser}
        onSavePlan={handleSavePlan}
        onResetLimits={handleResetLimits}
        loading={actionLoading}
      />

      <h3 className="section-heading">
        User <span className="highlight-text">Management</span>
      </h3>

      <UserStats
        stats={{
          total: users.length,
          students: users.filter((u) => u.role === "student").length,
          teachers: users.filter((u) => u.role === "teacher").length,
        }}
      />

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        onAddClick={() => {
          setEditingUser(null);
          setShowModal(true);
        }}
      />

      <UserTable
        users={filteredUsers}
        currentUser={currentUser}
        onEdit={(user) => {
          setEditingUser(user);
          setShowModal(true);
        }}
        onDelete={(id) => setDeleteModal({ isOpen: true, id })}
        onToggleStatus={handleToggleStatus}
        onToggleVerify={handleToggleVerify}
        onTogglePracticeMode={handleTogglePracticeMode} // ✅ PASSING FUNCTION TO TABLE
        onManageAccess={(user) => {
          setAccessUser(user);
          setShowAccessModal(true);
        }}
      />

      {showModal && (
        <AddEditUserModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          editingUser={editingUser}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default UserManagement;
