// import React from "react";
// import "./Auth.scss";
// import loginimg from "../../assets/imeages/login/login.png";
// import { Link } from "react-router-dom";
// import { FaLock, FaFacebookF, FaGithub, FaLinkedinIn } from "react-icons/fa";
// import { MdEmail } from "react-icons/md";
// import { FcGoogle } from "react-icons/fc";
// const LoginPage = () => {
//   return (
//     <div className="container-wrapper d-flex justify-content-center align-items-center vh-100">
//       <div className="login-register-card d-flex flex-column flex-md-row">
//         {/* Left Panel */}
//         <div className="left-panel">
//           <div className="overlay">
//             <img
//               src={loginimg}
//               alt="Student Working on Laptop"
//               className="illustration"
//             />
//             <h2 className="mt-4">Welcome Back!</h2>
//             <p>Master every test with confidence!</p>
//             <Link className="button-primary btn" to={"/register"}>
//               Register{" "}
//             </Link>
//           </div>
//         </div>

//         {/* Right Panel */}
//         <div className="right-panel">
//           <h2 className="mb-4">Login</h2>

//           <div className="form-group mb-3">
//             <div className="input-group">
//               <span className="input-group-text">
//                 <MdEmail />
//               </span>
//               <input
//                 type="email"
//                 className="form-control"
//                 placeholder="Email"
//               />
//             </div>
//           </div>

//           <div className="form-group mb-3">
//             <div className="input-group">
//               <span className="input-group-text">
//                 <FaLock />
//               </span>
//               <input
//                 type="password"
//                 className="form-control"
//                 placeholder="Password"
//               />
//             </div>
//           </div>

//           <p className="text-end mb-3 forgot">Forgot password?</p>

//           <button className="btn button-primary w-100 mb-3">Login</button>

//           <p className="text-center mb-2">or login with social platforms</p>

//           <div className="social-icons d-flex justify-content-center gap-3">
//             <FcGoogle className="icon" />
//             <FaFacebookF className="icon fb" />
//             <FaGithub className="icon gh" />
//             <FaLinkedinIn className="icon li" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import "./Auth.scss";
import loginimg from "../../assets/imeages/login/login.png";
import { Link } from "react-router-dom";
import { FaLock, FaFacebookF, FaGithub, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../../context/UserContext"; // 👈 Import context

const LoginPage = () => {
  const { login } = useUser(); // 👈 get login function from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      alert(response.message); // 👈 You can replace this with a toast or navigate to dashboard
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="container-wrapper d-flex justify-content-center align-items-center vh-100">
      <div className="login-register-card d-flex flex-column flex-md-row">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="overlay">
            <img
              src={loginimg}
              alt="Student Working on Laptop"
              className="illustration"
            />
            <h2 className="mt-4">Welcome Back!</h2>
            <p>Master every test with confidence!</p>
            <Link className="button-primary btn" to={"/register"}>
              Register
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
                  required
                />
              </div>
            </div>

            <p className="text-end mb-3 forgot">Forgot password?</p>

            <button type="submit" className="btn button-primary w-100 mb-3">
              Login
            </button>
          </form>

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

export default LoginPage;
