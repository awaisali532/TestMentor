import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaSave,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";
import "./SiteSettings.css";

// ✅ Import TMLoader
import TMLoader from "../../../components/common/TMLoader/TMLoader";

const SiteSettings = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    phone: "",
    officeAddress: "",
    supportEmail: "",
  });

  const [loading, setLoading] = useState(true); // Initial Load
  const [saving, setSaving] = useState(false); // Saving Action

  // --- 1. Fetch Current Settings ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/users/admin-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.businessInfo) {
          setFormData({
            phone: res.data.businessInfo.phone || "",
            officeAddress: res.data.businessInfo.officeAddress || "",
            supportEmail: res.data.businessInfo.supportEmail || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [BASE_URL]);

  // --- 2. Handle Input Change ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. Save Changes ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); // ✅ Show TMLoader

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/users/business-info`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false); // ✅ Hide TMLoader
    }
  };

  return (
    <>
      {/* ✅ Show TMLoader if Loading (Initial) or Saving */}
      {(loading || saving) && <TMLoader />}

      <div className="site-settings-wrapper p-4">
        <Toaster position="top-center" reverseOrder={false} />

        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Header Section */}
          <div className="d-flex align-items-center gap-3 mb-4 header-anim">
            <div className="icon-box-header">
              <FaGlobe size={24} />
            </div>
            <div>
              <h2 className="fw-bold m-0 gradient-title">Site Configuration</h2>
              <p className="m-0 settings-subtitle">
                Manage your contact details and business info.
              </p>
            </div>
          </div>

          {/* GLOWING CARD */}
          <div className="card settings-card border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit}>
                {/* Phone Number */}
                <div className="mb-4">
                  <label className="form-label fw-bold input-label">
                    <FaPhone className="me-2 icon-accent" /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control custom-admin-input"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Support Email */}
                <div className="mb-4">
                  <label className="form-label fw-bold input-label">
                    <FaEnvelope className="me-2 icon-accent" /> Support Email
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    className="form-control custom-admin-input"
                    placeholder="support@testmentor.com"
                    value={formData.supportEmail}
                    onChange={handleChange}
                  />
                </div>

                {/* Office Address */}
                <div className="mb-4">
                  <label className="form-label fw-bold input-label">
                    <FaMapMarkerAlt className="me-2 icon-accent" /> Office
                    Address
                  </label>
                  <textarea
                    name="officeAddress"
                    rows="3"
                    className="form-control custom-admin-input"
                    placeholder="123 Main St, City, Country"
                    value={formData.officeAddress}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* Save Button */}
                <div className="d-flex justify-content-end mt-5">
                  <button
                    type="submit"
                    className="btn btn-glow px-5 py-3 rounded-pill fw-bold d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    <FaSave /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SiteSettings;
