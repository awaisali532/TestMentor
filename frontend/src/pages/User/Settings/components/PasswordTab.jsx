import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../../../../components/ui/Loader";
import useUnsavedChanges from "../../../../hooks/useUnsavedChanges";

const PasswordTab = ({ setHasUnsavedChanges }) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // ✅ 1. Unsaved Changes Guard
  const isDirty =
    (passwords.current !== "" || passwords.new !== "") && !isSubmitted;
  useUnsavedChanges(isDirty);
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false); // Cleanup on unmount
  }, [isDirty, setHasUnsavedChanges]);
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // ✅ 4. Password Same Check (Frontend Logic)
    if (passwords.current === passwords.new) {
      return toast.error(
        "New password cannot be the same as the current password.",
      );
    }

    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match!");
    }

    if (passwords.new.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/change-password`,
        { oldPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsSubmitted(true); // Disable unsaved warning on success
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
      setTimeout(() => setIsSubmitted(false), 500);
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* ✅ 2. Full Screen Loader */}
      {loading && <Loader fullScreen={true} text="Updating Password..." />}

      <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent-1/10 flex items-center justify-center text-accent-1">
          <FaLock size={18} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-main leading-tight">
            Change Password
          </h3>
          <p className="text-xs text-muted font-medium">
            Keep your account secure.
          </p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-main mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
            className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-main mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              placeholder="New Password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-main mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              placeholder="Confirm New"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-transparent border-2 border-border text-muted font-bold rounded-xl hover:border-accent-1 hover:text-accent-1 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordTab;
