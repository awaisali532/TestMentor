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
import toast, { Toaster } from "react-hot-toast";
import { validatePassword } from "../../utils/validators"; // 👈 IMPORT VALIDATOR

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

    // 🔒 PASSWORD VALIDATION CHECK
    const passwordError = validatePassword(password, email);
    if (passwordError) {
      return toast.error(passwordError);
    }

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
    <div className="container-wrapper d-flex justify-content-center align-items-center">
      {/* <Toaster position="top-center" /> */}

      <div className="login-register-card d-flex flex-column flex-md-row">
        {/* Left Panel (Same as before) */}
        <div className="left-panel">
          <div className="overlay">
            <img
              src={registerimg}
              alt="Illustration"
              className="illustration"
            />
            <h2 className="mt-4">Join TestMentor</h2>
            <p>Start your journey to success today!</p>
            <Link className="button-primary" to={"/login"}>
              Login Here
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h2 className="mb-4">Register</h2>

          <form onSubmit={handleRegister}>
            {/* Name Input */}
            <div className="form-group mb-3">
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

            {/* Email Input */}
            <div className="form-group mb-3">
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

            {/* Password Input with Validation Text */}
            <div className="form-group mb-2">
              {" "}
              {/* mb-3 se mb-2 kia taaki text qareeb aye */}
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
            </div>

            {/* 👇 HELPER TEXT FOR PASSWORD */}
            <div
              className="mb-3 text-muted"
              style={{ fontSize: "0.75rem", lineHeight: "1.2" }}
            >
              * Must be 8+ chars with Uppercase, Lowercase, Number & Symbol.
              <br />* Cannot be same as email.
            </div>

            {/* Role Selection */}
            <div className="form-group mb-4 d-flex align-items-center p-2 border rounded bg-light">
              <FaUserTag className="me-2 text-secondary" />
              <label className="me-3 mb-0 fw-bold small text-secondary">
                I am a:
              </label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="student"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ cursor: "pointer" }}
                />
                <label
                  className="form-check-label"
                  htmlFor="student"
                  style={{ cursor: "pointer" }}
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
                  style={{ cursor: "pointer" }}
                />
                <label
                  className="form-check-label"
                  htmlFor="teacher"
                  style={{ cursor: "pointer" }}
                >
                  Teacher
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="button-primary w-100 mb-3 d-flex justify-content-center align-items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="icon-spin" /> Creating Account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Social Icons (Same as before) */}
          <p className="text-center mb-2 small text-muted">
            or register with social platforms
          </p>
          <div className="social-icons d-flex justify-content-center gap-3">
            <FcGoogle className="icon" />
            <FaFacebookF className="icon fb" />
            <FaGithub className="icon gh" />
            <FaLinkedinIn className="icon li" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
