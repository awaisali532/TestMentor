import React from "react";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route } from "react-router-dom";
import Home from "./assets/pages/Home/Home";
import RegisterLogin from "./assets/pages/RegisterLogin/RegisterLogin";
import StudentDashboard from "./assets/pages/Student/StudentDashboard";
import TeacherDashboard from "./assets/pages/Teacher/TeacherDashboard";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterLogin />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </div>
  );
};

export default App;
