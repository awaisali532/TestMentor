import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import toast from "react-hot-toast";

import { useUser } from "../../context/UserContext";
import { validateRegisterInput } from "../../utils/validators";
import registerimg from "../../assets/images/Auth/registerimg.png";

// Components
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import SocialLogins from "./components/SocialLogins";
import OtpVerification from "./components/OtpVerification";
import Loader from "../../components/ui/Loader";
import PasswordChecker from "./components/PasswordChecker"; // ✅ Naya component import kiya

const RegisterPage = () => {
  const { register } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const savedSession = localStorage.getItem("otp_persist_reg");
    if (savedSession) {
      const { email: savedEmail, timestamp } = JSON.parse(savedSession);
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        setEmail(savedEmail);
        setStep(2);
      } else {
        localStorage.removeItem("otp_persist_reg");
      }
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const errorMsg = validateRegisterInput(name, email, password);
    if (errorMsg) return toast.error(errorMsg);

    setLoading(true);
    try {
      await register(name, email, password, gender);
      toast.success("OTP Sent to Email!");
      localStorage.setItem(
        "otp_persist_reg",
        JSON.stringify({ email, timestamp: Date.now() }),
      );
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    localStorage.removeItem("otp_persist_reg");
    toast.success("Account created! Please log in.");
    navigate("/login");
  };

  return (
    <>
      {loading && <Loader fullScreen={true} text="Creating Account..." />}

      <AuthLayout
        imageSrc={registerimg}
        title="Join Us!"
        subtitle="Start your journey with TestMentor. Access premium tests instantly."
        linkMessage="Already have an account?"
        linkText="Login Here"
        linkTo="/login"
      >
        {step === 1 ? (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-main mb-2">
                Create Account
              </h2>
              <p className="text-muted">Fill in your details to get started.</p>
            </div>

            <form onSubmit={handleRegister}>
              <AuthInput
                icon={FaUser}
                type="text"
                name="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <AuthInput
                icon={MdEmail}
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Input (Bina purane helpText ke) */}
              <AuthInput
                icon={FaLock}
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* ✅ Naya Dynamic Password Checker */}
              {password.length > 0 && <PasswordChecker password={password} />}

              {/* Gender Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-main mb-3">
                  Gender
                </label>
                <div className="flex gap-4">
                  {["Male", "Female"].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all ${gender === opt ? "bg-accent-1/10 border-accent-1 text-accent-1" : "border-border bg-bg-body text-muted hover:border-accent-1/50"}`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={opt}
                        checked={gender === opt}
                        onChange={(e) => setGender(e.target.value)}
                        className="hidden"
                      />
                      <span className="font-semibold">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              >
                Register
              </button>
            </form>
            <SocialLogins text="Or register with" />
          </div>
        ) : (
          <OtpVerification
            email={email}
            onVerified={handleVerificationSuccess}
            onBack={() => {
              localStorage.removeItem("otp_persist_reg");
              setStep(1);
            }}
          />
        )}
      </AuthLayout>
    </>
  );
};

export default RegisterPage;
