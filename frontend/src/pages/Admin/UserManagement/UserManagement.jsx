import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";
import UserStats from "./UserStats";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import AddEditUserModal from "./AddEditUserModal";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../../../context/UserContext"; // 👈 IMPORT CONTEXT

const UserManagement = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ✅ Get authLoading from Context
  const { authLoading } = useUser();

  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  // --- 1. FETCH USERS (Wait for Auth to be Ready) ---
  useEffect(() => {
    // 🛑 If Auth is still loading, DO NOT fetch yet
    if (authLoading) return;

    fetchUsers();
  }, [authLoading]); // 👈 Run this when authLoading changes

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${BASE_URL}/api/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`, // Manually attaching token
        },
      });

      setUsers(data);
    } catch (error) {
      console.error("3. API Error:", error);

      if (error.response && error.response.status === 401) {
        toast.error("Unauthorized! Your role is not Admin.");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- STATS ---
  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
  };

  // --- ACTIONS ---
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/api/users/${id}`);
          setUsers(users.filter((u) => u._id !== id));
          toast.success("User deleted successfully");
        } catch (error) {
          toast.error(error.response?.data?.error || "Failed to delete user");
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

  // 4. Save Data (Updated with Loading)
  const handleSaveUser = async (formData) => {
    setSaving(true); // ⏳ Start Loading
    try {
      if (editingUser) {
        // UPDATE Existing
        const { data } = await axios.put(
          `${BASE_URL}/api/users/${editingUser._id}`,
          formData
        );

        setUsers(
          users.map((u) =>
            u._id === editingUser._id ? { ...u, ...formData } : u
          )
        );
        toast.success("User updated successfully");
      } else {
        // ADD New
        const { data } = await axios.post(
          `${BASE_URL}/api/users/add`,
          formData
        );

        setUsers([data.user, ...users]);
        toast.success("New user created");
      }
      setShowModal(false);
    } catch (error) {
      const msg = error.response?.data?.error || "Operation failed";
      toast.error(msg);
    } finally {
      setSaving(false); // ✅ Stop Loading
    }
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowModal(true);
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

  // Show loading spinner while Auth or Data is loading
  if (loading || authLoading)
    return (
      <div className="text-center p-5 text-muted fw-bold">Loading Users...</div>
    );

  return (
    <div className="user-wrapper p-4">
      <Toaster position="top-right" />

      <h3 className="fw-bold text-dark mb-4">User Management</h3>

      <UserStats stats={stats} />

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        onAddClick={handleAddClick}
      />

      <UserTable
        users={filteredUsers}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <AddEditUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        loading={saving}
      />
    </div>
  );
};

export default UserManagement;
