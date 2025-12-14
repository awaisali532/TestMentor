import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaSave,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";
import "./SiteSettings.css";

const SiteSettings = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    phone: "",
    officeAddress: "",
    supportEmail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- 1. Fetch Current Settings ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // We reuse getAdminProfile because it contains the businessInfo object
        const res = await axios.get(`${BASE_URL}/api/users/admin-profile`);
        if (res.data.businessInfo) {
          setFormData({
            phone: res.data.businessInfo.phone,
            officeAddress: res.data.businessInfo.officeAddress,
            supportEmail: res.data.businessInfo.supportEmail,
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
    setSaving(true);
    const toastId = toast.loading("Updating settings...");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/users/business-info`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Site settings updated!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Update failed. Ensure you are Super Admin.", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-5 text-center">Loading Settings...</div>;

  return (
    <div className="site-settings-wrapper p-4">
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="icon-box-header">
            <FaGlobe size={24} />
          </div>
          <div>
            <h2 className="fw-bold m-0 text-dark">Site Configuration</h2>
            <p className="text-muted m-0">
              Update contact details visible on the Contact Us page.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              {/* Phone Number */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  <FaPhone className="me-2" /> Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="form-control custom-admin-input"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Display format (e.g. +1 (555) 000-0000)
                </small>
              </div>

              {/* Support Email */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  <FaEnvelope className="me-2" /> Support Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  className="form-control custom-admin-input"
                  placeholder="support@testmentor.com"
                  value={formData.supportEmail}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Where users should send email inquiries.
                </small>
              </div>

              {/* Office Address */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  <FaMapMarkerAlt className="me-2" /> Office Address
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

              {/* Action Button */}
              <div className="d-flex justify-content-end mt-5">
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2"
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
