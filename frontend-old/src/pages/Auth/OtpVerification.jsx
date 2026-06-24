import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaShieldAlt, FaArrowLeft, FaRedo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

// ✅ Import Custom Components
import TMLoader from "../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../components/common/ConfirmationModal/ConfirmationModal";

const OtpVerification = ({ email, onVerified, onBack }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // ✅ Modal State
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- INPUT LOGIC (Same as before) ---
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  // --- ACTIONS ---
  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) return toast.error("Please enter complete OTP");

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email,
        otp: finalOtp,
      });
      toast.success(res.data.message || "Email Verified Successfully!");

      // ✅ Clear Storage on Success
      localStorage.removeItem("pending_otp_data");

      if (onVerified) onVerified(res.data);
      else setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/resend-otp`, { email });
      toast.success("New OTP sent!");
      setResendTimer(60);
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Back Button Click
  const handleBackClick = () => {
    setShowExitConfirm(true); // Modal dikhao
  };

  // ✅ Confirm Exit Logic
  const confirmExit = () => {
    localStorage.removeItem("pending_otp_data"); // Data safaya
    setShowExitConfirm(false);
    onBack(); // Parent ko bolo wapis jaye
  };

  return (
    <>
      {loading && <TMLoader />}

      {/* ✅ Confirmation Modal */}
      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
        title="Stop Verification?"
        message="If you leave now, the verification process will stop. You will need to request a new code later. Are you sure?"
        confirmText="Yes, Leave"
        cancelText="Stay Here"
        isDanger={true}
      />

      <div className="otp-modern-container fade-in">
        <div className="otp-icon-wrapper">
          <FaShieldAlt className="otp-main-icon" />
        </div>

        <div className="otp-text-content">
          <h3>Verification Required</h3>
          <p>
            Enter the 6-digit code sent to <br />
            <span className="highlight-email">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="otp-inputs-wrapper">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                className="otp-box"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-auth w-100 mt-4"
            disabled={loading || otp.join("").length < 6}
          >
            Verify Account
          </button>
        </form>

        <div className="otp-footer">
          {resendTimer > 0 ? (
            <span className="timer-text">
              Resend code in 00:
              {resendTimer < 10 ? `0${resendTimer}` : resendTimer}
            </span>
          ) : (
            <button
              className="btn-resend"
              onClick={handleResend}
              disabled={loading}
            >
              <FaRedo className="me-1" /> Resend Code
            </button>
          )}

          <div className="divider"></div>

          {/* ✅ Trigger Modal on Click */}
          <button onClick={handleBackClick} className="btn-back-link">
            <FaArrowLeft className="me-1" /> Wrong Email?
          </button>
        </div>
      </div>
    </>
  );
};

export default OtpVerification;
