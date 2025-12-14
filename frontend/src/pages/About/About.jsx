import React, { useState, useEffect } from "react";
import axios from "axios";
import "./About.css";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaFilePdf,
  FaCode,
  FaLightbulb,
  FaRocket,
  FaQuoteLeft,
  FaUserSecret, // Fallback icon
} from "react-icons/fa";

const About = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATES ---
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/admin-profile`);
        setDeveloper(res.data);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [BASE_URL]);

  // --- HANDLERS ---
  const handleViewResume = () => {
    if (!developer?.resume) return;

    let url = developer.resume;
    // Helper to ensure PDF opens in browser if using Cloudinary
    if (url.includes("/upload/") && !url.toLowerCase().endsWith(".pdf")) {
      url = url + ".pdf";
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className="about-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Fallback if no admin data found
  if (!developer) return null;

  return (
    <div className="about-wrapper">
      {/* 1. HERO SECTION */}
      <section className="about-hero">
        <div className="container text-center">
          <h1 className="about-title">
            Innovating <span className="highlight-text">Education</span>
          </h1>
          <p className="about-subtitle">
            We are on a mission to make self-assessment smarter, faster, and
            accessible to everyone.
          </p>
        </div>
      </section>

      {/* 2. MISSION CARDS */}
      <section className="mission-section container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="mission-card">
              <div className="icon-box">
                <FaLightbulb />
              </div>
              <h3>Our Vision</h3>
              <p>
                To empower students with AI-driven tools that make exam
                preparation effortless and effective.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="mission-card">
              <div className="icon-box">
                <FaRocket />
              </div>
              <h3>Our Mission</h3>
              <p>
                Providing a seamless platform for generating papers, taking
                tests, and tracking progress in real-time.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="mission-card">
              <div className="icon-box">
                <FaCode />
              </div>
              <h3>The Tech</h3>
              <p>
                Built on the robust MERN Stack (MongoDB, Express, React,
                Node.js) for speed and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEVELOPER PROFILE SECTION */}
      <section className="developer-section">
        <div className="container">
          <div className="dev-card-wrapper">
            <div className="row align-items-center">
              {/* Left: Image */}
              <div className="col-lg-5 text-center mb-4 mb-lg-0">
                <div className="dev-img-container">
                  {developer.image ? (
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="dev-img"
                    />
                  ) : (
                    <div className="dev-img-placeholder">
                      <FaUserSecret size={80} color="#fff" />
                    </div>
                  )}
                  <div className="floating-badge">
                    <FaCode /> <span>Dev</span>
                  </div>
                </div>
              </div>

              {/* Right: Info */}
              <div className="col-lg-7">
                <div className="dev-content">
                  <span className="role-badge">Lead Developer</span>
                  <h2 className="dev-name">
                    Meet{" "}
                    <span className="highlight-text">{developer.name}</span>
                  </h2>

                  <div className="quote-box">
                    <FaQuoteLeft className="quote-icon" />
                    <p>
                      {developer.bio ||
                        "Passionate about building scalable web applications and creating intuitive user experiences that solve real-world problems."}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="actions-row">
                    <div className="social-links">
                      {/* GitHub Link */}
                      <a
                        href="https://github.com/awaisali532"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn github"
                      >
                        <FaGithub />
                      </a>

                      {/* LinkedIn Link */}
                      <a
                        href="https://www.linkedin.com/in/awais-ali-080a61332/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn linkedin"
                      >
                        <FaLinkedin />
                      </a>

                      {/* Email Link */}
                      <a
                        href="mailto:awaisali532193@gmail.com"
                        className="social-btn email"
                      >
                        <FaEnvelope />
                      </a>
                    </div>

                    <div className="divider-vertical d-none d-md-block"></div>

                    {/* Resume Button - Only shows if resume exists */}
                    {developer.resume && (
                      <button className="btn-resume" onClick={handleViewResume}>
                        <FaFilePdf className="me-2" /> View Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
