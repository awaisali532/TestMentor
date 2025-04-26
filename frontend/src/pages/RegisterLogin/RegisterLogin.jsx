import React, { useState } from "react";
import "./RegisterLogin.scss";
import registerimg from "../../assets/imeages/registerimg/registerimg.png";
import {
  FaUser,
  FaLock,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaUserTag,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container-wrapper d-flex justify-content-center align-items-center vh-100">
      <div className="login-register-card d-flex flex-column flex-md-row">
        {/* Left Panel with Illustration */}
        <div className="left-panel">
          <div className="overlay">
            <img
              src={registerimg}
              alt="Student Working on Laptop"
              className="illustration"
            />
            <h2 className="mt-4">Welcome to TestMentor</h2>
            <p>Master every test with confidence!</p>
            {isLogin ? (
              <button
                className="btn button-primary switch-btn"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            ) : (
              <button
                className="btn button-primary switch-btn"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Right Panel Form */}
        <div className="right-panel">
          <h2 className="mb-4">{isLogin ? "Login" : "Register"}</h2>

          {!isLogin && (
            <div className="form-group mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name"
                />
              </div>
            </div>
          )}

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
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
              />
            </div>
          </div>

          {!isLogin && (
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
                />
                <label className="form-check-label" htmlFor="teacher">
                  Teacher
                </label>
              </div>
            </div>
          )}

          {isLogin && <p className="text-end mb-3 forgot">Forgot password?</p>}

          <button className="btn button-primary w-100 mb-3">
            {isLogin ? "Login" : "Register"}
          </button>

          <p className="text-center mb-2">or login with social platforms</p>

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

export default LoginRegisterPage;
