import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../../../context/UserContext"; // ✅ Context

// Import CSS
import "./UserManagement.css";

// Import Components
import UserStats from "./UserStats/UserStats";
import UserFilters from "./UserFilters/UserFilters";
import UserTable from "./UserTable/UserTable";
import AddEditUserModal from "./AddEditUserModal/AddEditUserModal";

const UserManagement = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ✅ Get 'user' (Current Logged In Info) along with authLoading
  const { authLoading, user: currentUser } = useUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // inside the component

  // Add this line to debug

  useEffect(() => {
    if (authLoading) return;
    fetchUsers();
  }, [authLoading]);

  const fetchUsers = async () => {
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

  // Delete Logic
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "var(--card-bg)",
      color: "var(--text-main)",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        try {
          await axios.delete(`${BASE_URL}/api/users/${id}`);
          setUsers(users.filter((u) => u._id !== id));
          toast.success("User deleted successfully");
        } catch (error) {
          toast.error(error.response?.data?.error || "Failed to delete user");
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/users/status/${id}`);
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: !u.isActive } : u))
      );
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveUser = async (formData) => {
    setSaving(true);
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
      setSaving(false);
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

  if (loading || authLoading)
    return <div className="loading-screen">Loading Users...</div>;

  return (
    <div className="user-wrapper">
      <Toaster position="top-right" />

      {/* Full Screen Loader Overlay */}
      {isDeleting && (
        <div className="full-screen-loader">
          <div className="loader-content">
            <div className="spinner-border text-light mb-3" role="status"></div>
            <p>Deleting User...</p>
          </div>
        </div>
      )}

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

      {/* ✅ Pass currentUser to Table */}
      <UserTable
        users={filteredUsers}
        currentUser={currentUser}
        onEdit={(user) => {
          setEditingUser(user);
          setShowModal(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {showModal && (
        <AddEditUserModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          editingUser={editingUser}
          loading={saving}
        />
      )}
    </div>
  );
};

export default UserManagement;
