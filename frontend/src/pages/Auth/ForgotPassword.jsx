import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ SweetAlert Import

import loginimg from "../../assets/images/Auth/login.png";
import { validateEmail, validatePassword } from "../../utils/validators";

import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import OtpBox from "./components/OtpBox";
import Loader from "../../components/ui/Loader";
import useUnsavedChanges from "../../hooks/useUnsavedChanges";
const ForgotPassword = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const isFormDirty =
    email.length > 0 || otp.join("").length > 0 || newPassword.length > 0;
  useUnsavedChanges(isFormDirty);
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) return toast.error("Please enter 6-digit code.");

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-reset-otp`, {
        email,
        otp: finalOtp,
      });
      toast.success("Code Verified!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passError = validatePassword(newPassword);
    if (passError) return toast.error(passError);

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        email,
        otp: otp.join(""),
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

  // ✅ SweetAlert2 Logic
  const handleCancel = () => {
    if (step > 1) {
      Swal.fire({
        title: "Cancel Recovery?",
        text: "If you leave now, you will lose your progress.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#334155",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "Stay",
        background: "#0f172a",
        color: "#ffffff",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {loading && <Loader fullScreen={true} text="Processing..." />}

      <AuthLayout
        imageSrc={loginimg}
        title="Recovery"
        subtitle="Follow the steps to securely reset your password."
        linkMessage="Remember your password?"
        linkText="Back to Login"
        linkTo="/login"
      >
        <div className="animate-fade-in text-center sm:text-left">
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-3xl font-extrabold text-main mb-2">
                Forgot Password?
              </h2>
              <p className="text-muted mb-8">
                Enter your email to receive a reset code.
              </p>
              <AuthInput
                icon={FaEnvelope}
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all"
              >
                Send Code
              </button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleVerifyOtp}
              className="flex flex-col items-center sm:items-stretch text-center"
            >
              <div className="size-16 rounded-full bg-accent-1/10 flex items-center justify-center mb-4 mx-auto text-accent-1 text-2xl">
                <FaShieldAlt />
              </div>
              <h3 className="font-extrabold text-2xl text-main mb-2">
                Verification Code
              </h3>
              <p className="text-muted text-sm mb-6">
                Code sent to <strong className="text-accent-1">{email}</strong>
              </p>

              <OtpBox otp={otp} setOtp={setOtp} />

              <button
                type="submit"
                disabled={otp.join("").length < 6}
                className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-50"
              >
                Verify Code
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <h2 className="text-3xl font-extrabold text-main mb-2">
                Set New Password
              </h2>
              <p className="text-muted mb-8">
                Create a strong password for your account.
              </p>
              <AuthInput
                icon={FaLock}
                type="password"
                name="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helpText="* 8+ chars, Uppercase, Lowercase & Number."
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all"
              >
                Reset Password
              </button>
            </form>
          )}

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-semibold text-muted hover:text-main flex items-center transition-colors cursor-pointer"
            >
              <FaArrowLeft className="mr-2" />{" "}
              {step === 1 ? "Back to Login" : "Cancel"}
            </button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
