import React, { useState } from "react";
import "./Auth.css";
import loginimg from "../../assets/imeages/login/login.png";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLock,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"; // ✅ Imported Eye Icons
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../../context/UserContext";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ NEW STATE: Controls password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      const response = await login(email, password);
      toast.success("Welcome back!", { id: toastId });

      if (response.user.role === "admin") {
        // ✅ REPLACE: TRUE (This prevents Back button from going to Login page)
        navigate("/admin/dashboard", { replace: true });
      } else {
        // ✅ REPLACE: TRUE
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Login failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-wrapper d-flex justify-content-center align-items-center">
      {/* <Toaster position="top-center" /> */}
      <div className="login-register-card d-flex flex-column flex-md-row">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="overlay">
            <img src={loginimg} alt="Student" className="illustration" />
            <h2 className="mt-4">Welcome Back!</h2>
            <p>Don't have an account?</p>
            <Link className="button-primary" to="/register">
              Register Here
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h2 className="mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <MdEmail />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ✅ PASSWORD INPUT WITH EYE ICON */}
            <div className="form-group mb-3">
              <div className="input-group">
                {/* Lock Icon (Left) */}
                <span className="input-group-text">
                  <FaLock />
                </span>

                <input
                  // Logic: If showPassword is true -> text, else -> password
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Eye Icon (Right) - Clickable */}
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <p className="text-end mb-3 forgot">Forgot password?</p>

            <button
              type="submit"
              className="button-primary w-100 mb-3 d-flex justify-content-center align-items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="icon-spin" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="social-icons d-flex justify-content-center gap-3 mt-4">
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

export default LoginPage;
