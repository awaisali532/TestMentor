import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "../../../../context/UserContext";
import Loader from "../../../../components/ui/Loader";
import useUnsavedChanges from "../../../../hooks/useUnsavedChanges";

const PersonalTab = ({ user, setHasUnsavedChanges }) => {
  const { setUser } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ 1. Unsaved Changes Guard
  const isDirty = name !== user?.name && !isSubmitted;
  useUnsavedChanges(isDirty);
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false); // Cleanup on unmount
  }, [isDirty, setHasUnsavedChanges]);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsSubmitted(true); // Disable unsaved warning on success
      const updatedUser = { ...user, name: res.data.name || name };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile details updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
      setTimeout(() => setIsSubmitted(false), 500); // Reset for next edit
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* ✅ 2. Full Screen Loader */}
      {loading && <Loader fullScreen={true} text="Saving Changes..." />}

      <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent-1/10 flex items-center justify-center text-accent-1">
          <FaUser size={18} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-main leading-tight">
            Personal Information
          </h3>
          <p className="text-xs text-muted font-medium">
            Update your display name.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-main mb-2">
            Full Name
          </label>
          <div className="relative flex items-center">
            <FaUser className="absolute left-4 text-muted z-10" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-body border border-border text-main pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all font-medium"
              placeholder="e.g. Waqas Ali"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-main mb-2">
            Email Address
            <span className="bg-red-500/10 text-red-500 text-[10px] uppercase px-2 py-0.5 rounded-md">
              Locked
            </span>
          </label>
          <div className="relative flex items-center opacity-60 cursor-not-allowed">
            <FaEnvelope className="absolute left-4 text-muted z-10" />
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-bg-body border border-border text-main pl-11 pr-4 py-3 rounded-xl cursor-not-allowed font-medium"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || name === user?.name}
            className="flex items-center justify-center gap-2 bg-linear-to-br from-accent-1 to-accent-2 text-white font-bold px-8 py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
          >
            <FaSave /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalTab;
