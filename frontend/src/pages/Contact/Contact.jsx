import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ NEW: Dynamic Contact Info State
  const [contactInfo, setContactInfo] = useState({
    phone: "Loading...",
    address: "Loading...",
    email: "Loading...",
  });

  // --- FETCH CONTACT INFO ---
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/admin-profile`);
        if (res.data.businessInfo) {
          setContactInfo({
            phone: res.data.businessInfo.phone,
            address: res.data.businessInfo.officeAddress,
            email: res.data.businessInfo.supportEmail,
          });
        }
      } catch (err) {
        console.error("Failed to load contact info", err);
        setContactInfo({
          phone: "+92 300 1234567", // Fallback if API fails
          address: "Lahore, Pakistan",
          email: "support@testmentor.com",
        });
      }
    };
    fetchInfo();
  }, [BASE_URL]);

  // ... (HandleChange and HandleSubmit remain exactly the same as before) ...
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all required fields.");
    }
    setLoading(true);
    const toastId = toast.loading("Sending message...");
    try {
      const res = await axios.post(`${BASE_URL}/api/contact`, formData);
      if (res.data.success) {
        toast.success("Message sent successfully!", { id: toastId });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-wrapper">
      {/* Hero Section */}
      <section className="contact-hero text-center">
        <div className="container">
          <h1 className="contact-title">
            Get in <span className="highlight-text">Touch</span>
          </h1>
          <p className="contact-subtitle">
            Have questions about our test platform? We're here to help.
          </p>
        </div>
      </section>

      <section className="contact-content container">
        <div className="row g-5">
          {/* Left Side: Contact Info Cards */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-4">
              {/* Email Card */}
              <div className="info-card">
                <div className="icon-box">
                  <FaEnvelope />
                </div>
                <div>
                  <h5>Chat to us</h5>
                  <p>Our friendly team is here to help.</p>
                  {/* ✅ Dynamic Email */}
                  <a href={`mailto:${contactInfo.email}`} className="info-link">
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Address Card */}
              <div className="info-card">
                <div className="icon-box">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h5>Visit us</h5>
                  <p>Come say hello at our office HQ.</p>
                  {/* ✅ Dynamic Address */}
                  <span className="info-text">{contactInfo.address}</span>
                </div>
              </div>

              {/* Phone Card */}
              <div className="info-card">
                <div className="icon-box">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h5>Call us</h5>
                  <p>Mon-Fri from 8am to 5pm.</p>
                  {/* ✅ Dynamic Phone */}
                  <a href={`tel:${contactInfo.phone}`} className="info-link">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form (Same as before) */}
          <div className="col-lg-7">
            <div className="contact-form-card">
              <h3 className="form-title">Send us a message</h3>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control custom-input"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control custom-input"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-control custom-input"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    rows="5"
                    className="form-control custom-input"
                    placeholder="Leave us a message..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn-send-message"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="icon-spin me-2" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
