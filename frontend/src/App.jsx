import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import { UserProvider } from "./context/UserContext";
import Subjects from "./pages/Subjects/Subjects";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Navbar from "./components/Navbar/Navbar";
const App = () => {
  return (
    <div>
      <UserProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </UserProvider>
    </div>
  );
};

export default App;
