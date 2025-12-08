import React from "react";
import StatCard from "../../../components/Admin/Dashboard/StatCard/StatCard";
import "./Dashboard.css";
import {
  FaQuestion,
  FaBookOpen,
  FaGraduationCap,
  FaUsers,
  FaListUl,
  FaAlignLeft,
  FaFileAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
const Dashboard = () => {
  // Simulated data
  const graphData = [
    { label: "Math", height: "85%" },
    { label: "Science", height: "60%" },
    { label: "English", height: "75%" },
    { label: "History", height: "45%" },
    { label: "Urdu", height: "90%" },
  ];
  const recentData = [
    {
      type: "Multiple Choice",
      subject: "Physics",
      chapter: "Forces",
      date: "2024-05-20",
    },
    {
      type: "True/False",
      subject: "Math",
      chapter: "Algebra",
      date: "2024-05-19",
    },
    {
      type: "Essay",
      subject: "English",
      chapter: "Shakespeare",
      date: "2024-05-18",
    },
    { type: "MCQ", subject: "Urdu", chapter: "Ghazal", date: "2024-05-17" }, // This 4th item will be HIDDEN
    {
      type: "Short",
      subject: "Chemistry",
      chapter: "Bonding",
      date: "2024-05-16",
    }, // HIDDEN
  ];
  return (
    <div className="w-100">
      <h3 className="fw-bold text-dark mb-4">Admin Dashboard</h3>

      {/* 1. STAT CARDS */}
      <div className="row g-4 mb-3">
        <div className="col-md-3">
          <StatCard
            title="Total Questions"
            value="5,240"
            icon={<FaQuestion />}
            colorType="blue"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Active Subjects"
            value="12"
            icon={<FaBookOpen />}
            colorType="green"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Class Levels"
            value="4"
            icon={<FaGraduationCap />}
            colorType="orange"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Total Users"
            value="156"
            icon={<FaUsers />}
            colorType="cyan"
          />
        </div>
      </div>

      {/* 2. MIDDLE SECTION */}
      <div className="row g-4 mb-4">
        {/* Left: Bar Chart */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold text-secondary mb-4">
              Questions per Subject
            </h5>

            {/* Graph Container with Grid Lines */}
            <div
              className="d-flex justify-content-around align-items-end h-100 border-bottom pb-2"
              style={{
                minHeight: "200px",
                // 👇 THIS CREATES THE GRID LINES
                backgroundImage:
                  "linear-gradient(to bottom, #e9ecef 1px, transparent 1px)",
                backgroundSize: "100% 40px", // Adds a line every 40px
              }}
            >
              {graphData.map((item, index) => (
                <div
                  key={index}
                  className="d-flex flex-column align-items-center justify-content-end"
                  style={{ width: "40px", height: "100%" }}
                >
                  {/* The Bar */}
                  <div
                    className="w-100 rounded-top"
                    style={{
                      height: item.height,
                      backgroundColor: "#D1D5DB",
                      transition: "height 0.5s ease",
                      position: "relative", // Ensures bar is above grid if needed
                      zIndex: 2,
                    }}
                  ></div>
                  <span className="small text-muted fw-bold mt-2">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Question Distribution */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold text-secondary mb-4">
              Question Distribution
            </h5>

            {/* MCQ Item */}
            <div
              className="d-flex align-items-center p-3 mb-3 rounded-3"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#DBEAFE",
                  color: "#3B82F6",
                  fontSize: "20px",
                }}
              >
                <FaListUl />
              </div>
              <div className="d-flex justify-content-between w-100">
                <span className="fw-semibold text-secondary">
                  Multiple Choice
                </span>
                <span className="fw-bold text-dark">2,540</span>
              </div>
            </div>

            {/* Short Item */}
            <div
              className="d-flex align-items-center p-3 mb-3 rounded-3"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#DCFCE7",
                  color: "#22C55E",
                  fontSize: "20px",
                }}
              >
                <FaAlignLeft />
              </div>
              <div className="d-flex justify-content-between w-100">
                <span className="fw-semibold text-secondary">
                  Short Questions
                </span>
                <span className="fw-bold text-dark">1,250</span>
              </div>
            </div>

            {/* Long Item */}
            <div
              className="d-flex align-items-center p-3 rounded-3"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#FEF3C7",
                  color: "#F59E0B",
                  fontSize: "20px",
                }}
              >
                <FaFileAlt />
              </div>
              <div className="d-flex justify-content-between w-100">
                <span className="fw-semibold text-secondary">
                  Long Questions
                </span>
                <span className="fw-bold text-dark">850</span>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-3 border-top d-flex justify-content-between text-muted small">
              <span>Total Items:</span>
              <strong>4,640</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT DATA TABLE */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold text-secondary m-0">Recent Data Entry</h5>
          {/* Link to view all */}
          <Link
            to="/admin/recent-activity"
            className="text-primary small fw-bold text-decoration-none"
          >
            View All
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-borderless align-middle mb-0">
            <thead className="border-bottom">
              <tr className="text-secondary text-uppercase small">
                <th className="pb-3">Type</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Chapter</th>
                <th className="pb-3">Added</th>
                <th className="pb-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ 2. USE SLICE(0, 3) TO SHOW ONLY 3 ROWS */}
              {recentData.slice(0, 3).map((item, index) => (
                <tr key={index} className="border-bottom">
                  <td className="py-3">{item.type}</td>
                  <td className="py-3 fw-bold">{item.subject}</td>
                  <td className="py-3 text-muted">{item.chapter}</td>
                  <td className="py-3 text-muted">{item.date}</td>
                  <td className="py-3 text-end">
                    <span
                      className="text-primary fw-bold"
                      style={{ cursor: "pointer", fontSize: "14px" }}
                    >
                      Edit
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
