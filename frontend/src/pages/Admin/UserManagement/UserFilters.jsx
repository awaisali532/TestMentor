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
      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
        {/* LEFT: Search & Filter */}
        <div className="d-flex gap-3 align-items-center flex-grow-1">
          {/* Search Input */}
          <div className="input-group" style={{ maxWidth: "350px" }}>
            <span className="input-group-text bg-white border-end-0">
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
          <div className="d-flex align-items-center">
            <FaFilter className="text-muted me-2" />
            <select
              className="form-select form-select-sm"
              style={{ width: "150px" }}
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

        {/* RIGHT: Add Button */}
        <button
          className="btn btn-primary d-flex align-items-center gap-2 px-4"
          onClick={onAddClick}
        >
          <FaUserPlus /> Add New User
        </button>
      </div>
    </div>
  );
};

export default UserFilters;
