import React, { useState, useEffect } from "react";
import "./Auth.css";
import loginimg from "../../assets/imeages/login/login.png";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLock,
  FaFacebookF,
  FaGithub,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";
import OtpVerification from "./OtpVerification";
import TMLoader from "../../components/common/TMLoader/TMLoader";

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  // ✅ 1. PAGE LOAD: Check Storage
  useEffect(() => {
    const savedSession = localStorage.getItem("otp_persist_login");
    if (savedSession) {
      const { email: savedEmail, timestamp } = JSON.parse(savedSession);
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        setEmail(savedEmail);
        setShowOtp(true);
      } else {
        localStorage.removeItem("otp_persist_login");
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);
      toast.success("Welcome back!");
      localStorage.removeItem("otp_persist_login");

      if (response.user.isSuperAdmin || response.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    } catch (err) {
      // ✅ Handle "Unverified" Case
      if (err.notVerified) {
        toast.error("Account not verified! OTP sent.");

        localStorage.setItem(
          "otp_persist_login",
          JSON.stringify({
            email: email,
            timestamp: Date.now(),
          })
        );

        setShowOtp(true);
      } else {
        toast.error(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = (data) => {
    localStorage.removeItem("otp_persist_login");
    toast.success("Verified! Logging in...");
    if (data.token) window.location.reload();
    else setShowOtp(false);
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("otp_persist_login");
    setShowOtp(false);
  };

  return (
    <div className="container-wrapper">
      {loading && <TMLoader />}

      <div className="login-register-card">
        <div className="left-panel">
          <img src={loginimg} alt="Login" className="illustration" />
          <h2>Welcome Back!</h2>
          <p>Don't have an account yet? Join us today!</p>
          <Link to="/register" className="btn-outline-white">
            Register Here
          </Link>
        </div>

        <div className="right-panel">
          {showOtp ? (
            <OtpVerification
              email={email}
              onVerified={handleVerificationSuccess}
              onBack={handleBackToLogin}
            />
          ) : (
            <>
              <h2>Login to Account</h2>
              <form onSubmit={handleLogin}>
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
                      className="input-group-text clickable"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <Link to="/forgot-password" className="forgot d-block mb-3">
                  Forgot Password?
                </Link>{" "}
                <button type="submit" className="btn-auth">
                  Login
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
