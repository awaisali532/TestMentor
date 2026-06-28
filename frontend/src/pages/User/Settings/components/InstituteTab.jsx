import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "../../../../context/UserContext";
import Loader from "../../../../components/ui/Loader";
import useUnsavedChanges from "../../../../hooks/useUnsavedChanges";

const InstituteTab = ({ user, setHasUnsavedChanges }) => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [institute, setInstitute] = useState({
    name: user?.institute?.name || "",
    address: user?.institute?.address || "",
    phone: user?.institute?.phone || "",
  });

  // ✅ 1. Unsaved Changes Guard
  const isDirty =
    (institute.name !== (user?.institute?.name || "") ||
      institute.address !== (user?.institute?.address || "") ||
      institute.phone !== (user?.institute?.phone || "")) &&
    !isSubmitted;

  useUnsavedChanges(isDirty);
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false); // Cleanup on unmount
  }, [isDirty, setHasUnsavedChanges]);
  const handleUpdateInstitute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/institute/info`,
        institute,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsSubmitted(true); // Disable unsaved warning on success
      const updatedUser = {
        ...user,
        institute: { ...user.institute, ...res.data.institute },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Institute details updated!");
    } catch (err) {
      toast.error("Failed to update institute info");
    } finally {
      setLoading(false);
      setTimeout(() => setIsSubmitted(false), 500); // Reset
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* ✅ 2. Full Screen Loader */}
      {loading && <Loader fullScreen={true} text="Saving Institute Info..." />}

      <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent-1/10 flex items-center justify-center text-accent-1">
          <FaBuilding size={18} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-main leading-tight">
            Institute Settings
          </h3>
          <p className="text-xs text-muted font-medium">
            Manage your school or academy details.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateInstitute} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-main mb-2">
            Institute Name
          </label>
          <div className="relative flex items-center">
            <FaBuilding className="absolute left-4 text-muted z-10" />
            <input
              type="text"
              value={institute.name}
              onChange={(e) =>
                setInstitute({ ...institute, name: e.target.value })
              }
              className="w-full bg-bg-body border border-border text-main pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              placeholder="e.g. Bright Future Academy"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-main mb-2">
            Address
          </label>
          <div className="relative flex items-center">
            <FaMapMarkerAlt className="absolute left-4 text-muted z-10" />
            <input
              type="text"
              value={institute.address}
              onChange={(e) =>
                setInstitute({ ...institute, address: e.target.value })
              }
              className="w-full bg-bg-body border border-border text-main pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              placeholder="e.g. Main Boulevard, Lahore"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-main mb-2">
            Phone Number
          </label>
          <div className="relative flex items-center">
            <FaPhone className="absolute left-4 text-muted z-10" />
            <input
              type="text"
              value={institute.phone}
              onChange={(e) =>
                setInstitute({ ...institute, phone: e.target.value })
              }
              className="w-full bg-bg-body border border-border text-main pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
              placeholder="e.g. 0300-1234567"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-linear-to-br from-accent-1 to-accent-2 text-white font-bold px-8 py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            <FaSave /> Save Institute Info
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstituteTab;
