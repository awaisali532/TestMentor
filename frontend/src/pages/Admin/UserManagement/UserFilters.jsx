import React from "react";
import { FaSearch, FaUserPlus, FaFilter } from "react-icons/fa";

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  onAddClick,
}) => {
  return (
    <div className="card border-0 shadow-sm p-3 rounded-4 mb-4">
      {/* Container: Mobile=Column, Desktop=Row, Space-Between */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        {/* LEFT SIDE: Search + Filter */}
        <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto align-items-center flex-grow-1">
          {/* Search Box */}
          <div className="input-group search-box">
            <span className="input-group-text bg-white border-end-0 ps-3">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Dropdown */}
          <div className="filter-box w-100 w-md-auto">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaFilter className="text-muted" />
              </span>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Add Button */}
        <div className="w-100 w-md-auto">
          <button
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 w-100 py-2 fw-bold"
            onClick={onAddClick}
          >
            <FaUserPlus /> Add New User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
