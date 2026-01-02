import React, { useState, useEffect } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import registerimg from "../../assets/imeages/registerimg/registerimg.png";
import {
  FaUser,
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
import { validateRegisterInput } from "../../utils/validators";
import OtpVerification from "./OtpVerification";
import TMLoader from "../../components/common/TMLoader/TMLoader";

const RegisterPage = () => {
  const { register } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // ✅ 1. PAGE LOAD: Check Storage
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
      await register(name, email, password);

      toast.success("OTP Sent to Email!");
      saveAndStep2(email);
    } catch (err) {
      // ✅ Handle "User Exists" (Maybe unverified)
      if (err.message && err.message.includes("already exists")) {
        toast.error(err.message);
      } else {
        toast.error(err.message || "Registration Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveAndStep2 = (emailToSave) => {
    localStorage.setItem(
      "otp_persist_reg",
      JSON.stringify({
        email: emailToSave,
        timestamp: Date.now(),
      })
    );
    setStep(2);
  };

  const handleVerificationSuccess = () => {
    localStorage.removeItem("otp_persist_reg");
    navigate("/login");
  };

  const handleBackToForm = () => {
    localStorage.removeItem("otp_persist_reg");
    setStep(1);
  };

  return (
    <div className="container-wrapper">
      {loading && <TMLoader />}

      <div className="login-register-card">
        <div className="left-panel">
          <img src={registerimg} alt="Register" className="illustration" />
          <h2>Join Us!</h2>
          <p>Already have an account? Login to continue.</p>
          <Link to="/login" className="btn-outline-white">
            Login Here
          </Link>
        </div>

        <div className="right-panel">
          {step === 1 ? (
            <>
              <h2>Create Account</h2>
              <form onSubmit={handleRegister}>
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
                  <small className="text-muted d-block mt-1 small-font">
                    * 8+ chars, Uppercase, Lowercase, Number & Symbol.
                  </small>
                </div>
                <button type="submit" className="btn-auth">
                  Register
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
            </>
          ) : (
            <OtpVerification
              email={email}
              onVerified={handleVerificationSuccess}
              onBack={handleBackToForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
