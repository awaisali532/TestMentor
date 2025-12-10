import React from "react";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

const UserStats = ({ stats }) => {
  return (
    <div className="row g-4 mb-4">
      {/* Card 1: Total Users */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 rounded-4 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted text-uppercase small fw-bold mb-1">
                Total Users
              </h6>
              <h2 className="m-0 fw-bold text-dark">{stats.total}</h2>
            </div>
            <div className="stat-icon-box bg-primary bg-opacity-10 text-primary">
              <FaUsers />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Students */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 rounded-4 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted text-uppercase small fw-bold mb-1">
                Students
              </h6>
              <h2 className="m-0 fw-bold text-dark">{stats.students}</h2>
            </div>
            <div className="stat-icon-box bg-success bg-opacity-10 text-success">
              <FaUserGraduate />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Teachers */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 rounded-4 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted text-uppercase small fw-bold mb-1">
                Teachers
              </h6>
              <h2 className="m-0 fw-bold text-dark">{stats.teachers}</h2>
            </div>
            <div className="stat-icon-box bg-warning bg-opacity-10 text-warning">
              <FaChalkboardTeacher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
