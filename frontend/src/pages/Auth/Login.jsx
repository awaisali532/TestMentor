import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import toast from "react-hot-toast";

import { useUser } from "../../context/UserContext";
import loginimg from "../../assets/images/Auth/login.png";

// Custom Components
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import SocialLogins from "./components/SocialLogins";
import OtpVerification from "./components/OtpVerification";
import Loader from "../../components/ui/Loader";

const LoginPage = () => {
  // ✅ loginAfterVerification hook bhi nikal liya
  const { login, loginAfterVerification } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

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
    if (!email || !password) return toast.error("Please fill in all fields.");

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
      if (err.notVerified) {
        toast.error("Account not verified! OTP sent.");
        localStorage.setItem(
          "otp_persist_login",
          JSON.stringify({ email: email, timestamp: Date.now() }),
        );
        setShowOtp(true);
      } else {
        toast.error(err.message || "Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ BUG FIXED: No window.location.reload()
  const handleVerificationSuccess = (data) => {
    localStorage.removeItem("otp_persist_login");
    toast.success("Verified! Redirecting...");

    if (data.token && data.user) {
      // Context instantly update ho jayega bina reload ke
      loginAfterVerification(data.user, data.token);

      // Navigate to correct dashboard based on role
      if (data.user.isSuperAdmin || data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    } else {
      setShowOtp(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("otp_persist_login");
    setShowOtp(false);
  };

  return (
    <>
      {loading && <Loader fullScreen={true} text="Authenticating..." />}

      <AuthLayout
        imageSrc={loginimg}
        title="Welcome Back!"
        subtitle="We're glad to see you again. Log in to continue your journey."
        linkMessage="Don't have an account yet?"
        linkText="Create Account"
        linkTo="/register"
      >
        {showOtp ? (
          <OtpVerification
            email={email}
            onVerified={handleVerificationSuccess}
            onBack={handleBackToLogin}
          />
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-main mb-2">Log In</h2>
              <p className="text-muted">
                Enter your details to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <AuthInput
                icon={MdEmail}
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <AuthInput
                icon={FaLock}
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex justify-end mb-6">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-accent-1 hover:text-accent-2 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-1/40 cursor-pointer"
              >
                Sign In
              </button>
            </form>

            <SocialLogins />
          </div>
        )}
      </AuthLayout>
    </>
  );
};

export default LoginPage;
