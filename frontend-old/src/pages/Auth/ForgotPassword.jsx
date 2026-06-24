import React, { useState, useEffect, useRef } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import loginimg from "../../assets/imeages/login/login.png";
import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaRedo,
} from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import TMLoader from "../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../components/common/ConfirmationModal/ConfirmationModal";
import { validateEmail, validatePassword } from "../../utils/validators";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef([]);

  // Timer
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Input Handlers
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)].focus();
  };

  // --- STEP 1: SEND EMAIL ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        email,
      });
      toast.success(res.data.message);
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP (Updated) ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) return toast.error("Please enter 6-digit code.");

    setLoading(true);
    try {
      // ✅ Call Backend to Validate OTP
      const res = await axios.post(`${BASE_URL}/api/auth/verify-reset-otp`, {
        email,
        otp: finalOtp,
      });

      toast.success("Code Verified!");
      setStep(3); // ✅ Only move to Step 3 if backend says OK
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
      // Step change nahi hoga, user yahin rahega
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passError = validatePassword(newPassword);
    if (passError) return toast.error(passError);

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        email,
        otp: otp.join(""), // OTP dobara bhejenge final confirmation ke liye
        newPassword,
      });

      toast.success("Password Reset Successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset Failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend
  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      toast.success("New code sent!");
      setResendTimer(60);
    } catch (err) {
      toast.error("Failed to resend.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (step > 1) setShowExitConfirm(true);
    else navigate("/login");
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate("/login");
  };

  return (
    <div className="container-wrapper">
      {loading && <TMLoader />}

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
        title="Cancel Recovery?"
        message="If you leave now, you will lose your progress."
        confirmText="Yes, Leave"
        cancelText="Stay"
        isDanger={true}
      />

      <div className="login-register-card">
        <div className="left-panel">
          <img src={loginimg} alt="Recovery" className="illustration" />
          <h2>Recovery</h2>
          <p>Follow the steps to securely reset your password.</p>
        </div>

        <div className="right-panel">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="mb-2">Forgot Password?</h2>
              <p className="text-muted text-center mb-4">
                Enter email to receive a reset code.
              </p>
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
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
                <button type="submit" className="btn-auth">
                  Send Code
                </button>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div
              className="otp-modern-container fade-in"
              style={{ padding: 0 }}
            >
              <div className="otp-icon-wrapper mb-3">
                <FaShieldAlt className="otp-main-icon" />
              </div>
              <h3
                className="mb-2 text-center"
                style={{ color: "var(--text-main)" }}
              >
                Enter Verification Code
              </h3>
              <p className="text-center text-muted mb-4 small">
                Code sent to{" "}
                <strong style={{ color: "var(--primary-color)" }}>
                  {email}
                </strong>
              </p>

              <form onSubmit={handleVerifyOtp} style={{ width: "100%" }}>
                <div className="otp-inputs-wrapper">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      className="otp-box"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                      ref={(el) => (inputRefs.current[index] = el)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="btn-auth w-100 mt-4"
                  disabled={otp.join("").length < 6}
                >
                  Verify Code
                </button>
              </form>

              <div className="otp-footer mt-3">
                {resendTimer > 0 ? (
                  <span className="timer-text small">
                    Resend in 00:
                    {resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                  </span>
                ) : (
                  <button
                    className="btn-resend small"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    <FaRedo className="me-1" /> Resend Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="fade-in">
              <h2 className="mb-2">Set New Password</h2>
              <p className="text-muted text-center mb-4">
                Create a strong password for your account.
              </p>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      className="input-group-text clickable"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <small className="text-muted d-block mt-1 small-font">
                    * 8+ chars, Uppercase, Lowercase & Number.
                  </small>
                </div>
                <button type="submit" className="btn-auth">
                  Reset Password
                </button>
              </form>
            </div>
          )}

          <div className="text-center mt-4">
            <button onClick={handleBackClick} className="btn-back-link">
              <FaArrowLeft className="me-2" />{" "}
              {step === 1 ? "Back to Login" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
