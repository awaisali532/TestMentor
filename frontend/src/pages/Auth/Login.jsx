import React, { useState } from "react";
import "./Auth.css";
import loginimg from "../../assets/imeages/login/login.png"; // Ensure path is correct
import { Link, useNavigate } from "react-router-dom";
import {
  FaLock,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // const toastId = toast.loading("Verifying credentials...");

    try {
      const response = await login(email, password);
      toast.success("Welcome back!");

      // --- ✅ REDIRECTION LOGIC UPDATED ---
      if (response.user.isSuperAdmin) {
        // If Super Admin -> Admin Dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        // Everyone else (Free/Paid Users) -> User Dashboard
        navigate("/user/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Login failed.");
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
            src={loginimg}
            alt="Login Illustration"
            className="illustration"
          />
          <h2>Welcome Back!</h2>
          <p>Don't have an account yet? Join us today!</p>
          <Link to="/register" className="btn-outline-white">
            Register Here
          </Link>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h2>Login to Account</h2>

          <form onSubmit={handleLogin}>
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
            </div>

            <p className="forgot">Forgot Password?</p>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="icon-spin" /> Logging In...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="social-text">Or login with</p>
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

export default LoginPage;
