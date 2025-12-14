import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import registerimg from "../../assets/imeages/registerimg/registerimg.png";
import {
  FaUser,
  FaLock,
  FaUserTag,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";
import { validatePassword } from "../../utils/validators";

const RegisterPage = () => {
  const { register } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(password, email);
    if (passwordError) return toast.error(passwordError);

    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await register(name, email, password, role);
      toast.success(response.message, { id: toastId });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err || "Registration Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-wrapper">
      <div className="login-register-card">
        {/* Left Panel */}
        <div className="left-panel">
          <img
            src={registerimg}
            alt="Register Illustration"
            className="illustration"
          />
          <h2>Join Us!</h2>
          <p>Already have an account? Login to continue.</p>
          <Link to="/login" className="btn-outline-white">
            Login Here
          </Link>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h2>Create Account</h2>

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <MdEmail />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <small
                className="text-muted"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                * 8+ chars, Uppercase, Lowercase, Number & Symbol.
              </small>
            </div>

            {/* Role Selection */}
            <div
              className="form-group d-flex align-items-center p-2 border rounded"
              style={{ background: "var(--pill-bg)" }}
            >
              <FaUserTag
                className="me-2"
                style={{ color: "var(--text-muted)" }}
              />
              <span
                className="me-3 fw-bold small"
                style={{ color: "var(--text-main)" }}
              >
                I am a:
              </span>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="student"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label
                  className="form-check-label"
                  htmlFor="student"
                  style={{ color: "var(--text-main)" }}
                >
                  Student
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="teacher"
                  value="teacher"
                  checked={role === "teacher"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label
                  className="form-check-label"
                  htmlFor="teacher"
                  style={{ color: "var(--text-main)" }}
                >
                  Teacher
                </label>
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="icon-spin" /> Creating...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className="social-text">Or register with</p>
          <div className="social-icons">
            <div className="social-icon-btn">
              <FcGoogle />
            </div>
            <div className="social-icon-btn">
              <FaFacebookF style={{ color: "#1877f2" }} />
            </div>
            <div className="social-icon-btn">
              <FaGithub />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
