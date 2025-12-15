import React from "react";
import { FaSearch, FaUserPlus, FaFilter } from "react-icons/fa";
import "./UserFilters.css";

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  onAddClick,
}) => {
  return (
    <div className="filter-card mb-4">
      <div className="row g-3 align-items-center">
        {/* Search */}
        <div className="col-md-6">
          <div className="search-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter */}
        <div className="col-md-3">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <div className="col-md-3 text-md-end">
          <button className="btn-add-user" onClick={onAddClick}>
            <FaUserPlus className="me-2" /> Add User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
