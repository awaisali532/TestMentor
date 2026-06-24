import React from "react";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import "./UserStats.css";

const UserStats = ({ stats }) => {
  return (
    <div className="row g-4 mb-4">
      {/* Total Users */}
      <div className="col-md-4">
        <div className="stat-card blue">
          <div className="stat-info">
            <h6 className="stat-title">Total Users</h6>
            <h2 className="stat-value">{stats.total}</h2>
          </div>
          <div className="stat-icon-box">
            <FaUsers />
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="col-md-4">
        <div className="stat-card green">
          <div className="stat-info">
            <h6 className="stat-title">Students</h6>
            <h2 className="stat-value">{stats.students}</h2>
          </div>
          <div className="stat-icon-box">
            <FaUserGraduate />
          </div>
        </div>
      </div>

      {/* Teachers */}
      <div className="col-md-4">
        <div className="stat-card orange">
          <div className="stat-info">
            <h6 className="stat-title">Teachers</h6>
            <h2 className="stat-value">{stats.teachers}</h2>
          </div>
          <div className="stat-icon-box">
            <FaChalkboardTeacher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
