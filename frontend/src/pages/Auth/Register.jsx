import React, { useState } from "react";
import "./Auth.css";
import { Link } from "react-router-dom";
import registerimg from "../../assets/imeages/registerimg/registerimg.png";
import {
  FaUser,
  FaLock,
  FaUserTag,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa";
import { toast } from "react-toastify"; // 👈 Import toast for notifications
import { useNavigate } from "react-router-dom"; // 👈 Import useNavigate for redirection
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { useUser } from "../../context/UserContext"; // ✅ Correct import

const RegisterPage = () => {
  const { register } = useUser(); // ✅ Use context properly
  const navigate = useNavigate(); // 👈 Initialize useNavigate
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register(name, email, password, role);
      toast.success(response.message);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="container-wrapper d-flex justify-content-center align-items-center ">
      <div className="login-register-card d-flex flex-column flex-md-row">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="overlay">
            <img
              src={registerimg}
              alt="Student Working on Laptop"
              className="illustration"
            />
            <h2 className="mt-4">Join TestMentor</h2>
            <p>Master every test with confidence!</p>
            <Link className="button-primary" to={"/login"}>
              Login
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h2 className="mb-4">Register</h2>

          <form onSubmit={handleRegister}>
            <div className="form-group mb-3">
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
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-group mb-3 d-flex align-items-center">
              <FaUserTag className="me-2" />
              <label className="me-3 mb-0">Role:</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="student"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label className="form-check-label" htmlFor="student">
                  Student
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="teacher"
                  value="teacher"
                  checked={role === "teacher"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label className="form-check-label" htmlFor="teacher">
                  Teacher
                </label>
              </div>
            </div>

            <button type="submit" className="button-primary w-100 mb-3">
              Register
            </button>
          </form>

          <p className="text-center mb-2">or register with social platforms</p>

          <div className="social-icons d-flex justify-content-center gap-3">
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

export default RegisterPage;
