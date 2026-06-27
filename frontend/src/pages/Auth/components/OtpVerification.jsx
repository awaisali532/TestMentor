import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaShieldAlt, FaArrowLeft, FaRedo } from "react-icons/fa";
import Swal from "sweetalert2"; // ✅ SweetAlert Import

const OtpVerification = ({ email, onVerified, onBack }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
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
      localStorage.removeItem("pending_otp_data");
      if (onVerified) onVerified(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid OTP",
      );
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
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SweetAlert2 Logic
  const handleBackClick = () => {
    Swal.fire({
      title: "Stop Verification?",
      text: "If you leave now, the verification process will stop. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Red color for 'Leave'
      cancelButtonColor: "#334155", // Slate for 'Stay'
      confirmButtonText: "Yes, Leave",
      cancelButtonText: "Stay Here",
      background: "#0f172a",
      color: "#ffffff",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("pending_otp_data");
        onBack();
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center animate-fade-in">
      <div className="size-20 rounded-full bg-accent-1/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(var(--color-accent-1-rgb),0.15)]">
        <FaShieldAlt className="text-4xl text-accent-1" />
      </div>

      <h3 className="font-extrabold text-2xl text-main mb-2">
        Verification Required
      </h3>
      <p className="text-muted text-sm mb-8 leading-relaxed">
        Enter the 6-digit code sent to <br />
        <strong className="text-accent-1">{email}</strong>
      </p>

      <form onSubmit={handleVerify} className="w-full">
        <div className="flex gap-2 sm:gap-3 justify-center mb-8">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              autoFocus={index === 0}
              className="w-10 sm:w-12 h-12 sm:h-14 rounded-xl border-2 border-border bg-bg-body text-main text-xl font-bold text-center outline-none focus:border-accent-1 focus:ring-4 focus:ring-accent-1/15 transition-all duration-200"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length < 6}
          className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-1/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 w-full">
        {resendTimer > 0 ? (
          <span className="text-sm text-muted font-medium">
            Resend code in{" "}
            <span className="text-main">
              00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-sm font-bold text-accent-1 flex items-center hover:underline disabled:opacity-50"
          >
            <FaRedo className="mr-2" /> Resend Code
          </button>
        )}

        <div className="w-1/2 h-px bg-border my-2"></div>

        <button
          type="button"
          onClick={handleBackClick}
          className="text-sm text-muted flex items-center hover:text-main transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Wrong Email?
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
