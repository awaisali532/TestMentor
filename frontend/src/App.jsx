import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import { UserProvider } from "./context/UserContext";
import Subjects from "./pages/Subjects/Subjects";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Navbar from "./components/Navbar/Navbar";
import VerifyEmail from "./pages/Auth/EmailVerify";
import ManageSubjects from "./pages/Admin/ManageSubjects/ManageSubjects";
const App = () => {
  return (
    <div>
      <UserProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register/verify-email-address"
            element={<VerifyEmail />}
          />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/subjects" element={<ManageSubjects />} />
        </Routes>
        <ToastContainer /> {/* 👈 Required for showing toasts */}
      </UserProvider>
    </div>
  );
};

export default App;
