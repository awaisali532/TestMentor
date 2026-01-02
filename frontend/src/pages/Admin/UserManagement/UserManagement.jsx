import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../../../context/UserContext";

// Import CSS
import "./UserManagement.css";

// Import Components
import UserStats from "./UserStats/UserStats";
import UserFilters from "./UserFilters/UserFilters";
import UserTable from "./UserTable/UserTable";
import AddEditUserModal from "./AddEditUserModal/AddEditUserModal";

// ✅ Import TMLoader & ConfirmationModal
import TMLoader from "../../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";

const UserManagement = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ✅ Get 'user' (Current Logged In Info) along with authLoading
  const { authLoading, user: currentUser } = useUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Initial Fetch Loading
  const [actionLoading, setActionLoading] = useState(false); // For Save/Delete/Status actions

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // ✅ State for Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    if (authLoading) return;
    fetchUsers();
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
      if (error.response && error.response.status === 401) {
        toast.error("Unauthorized! Your role is not Admin.");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  // Stats Logic
  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
  };

  // --- DELETE LOGIC (Using ConfirmationModal) ---
  const handleDeleteTrigger = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null }); // Close Modal
    setActionLoading(true); // Show TMLoader

    try {
      await axios.delete(`${BASE_URL}/api/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // --- TOGGLE STATUS ---
  const handleToggleStatus = async (id) => {
    setActionLoading(true); // Show TMLoader (optional, but good for UX)
    try {
      await axios.patch(`${BASE_URL}/api/users/status/${id}`);
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: !u.isActive } : u))
      );
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // --- SAVE USER ---
  const handleSaveUser = async (formData) => {
    setActionLoading(true); // Show TMLoader
    try {
      if (editingUser) {
        await axios.put(`${BASE_URL}/api/users/${editingUser._id}`, formData);
        setUsers(
          users.map((u) =>
            u._id === editingUser._id ? { ...u, ...formData } : u
          )
        );
        toast.success("User updated successfully");
      } else {
        const { data } = await axios.post(
          `${BASE_URL}/api/users/add`,
          formData
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

  const filteredUsers = users.filter((user) => {
    const nameMatch = user.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = user.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="user-wrapper">
      <Toaster position="top-right" />

      {/* ✅ 1. Show TMLoader if loading or performing actions */}
      {(loading || authLoading || actionLoading) && <TMLoader />}

      {/* ✅ 2. Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User?"
        message="This user will be permanently deleted! Are you sure?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      <h3 className="section-heading">
        User <span className="highlight-text">Management</span>
      </h3>

      <UserStats stats={stats} />

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
        onDelete={handleDeleteTrigger} // ✅ Trigger Modal
        onToggleStatus={handleToggleStatus}
      />

      {showModal && (
        <AddEditUserModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          editingUser={editingUser}
          loading={actionLoading} // Pass loading state if modal needs it (e.g. disable buttons)
        />
      )}
    </div>
  );
};

export default UserManagement;
