import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  FaLayerGroup,
  FaPlus,
  FaCheck,
  FaChevronDown,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

// ✅ Import dedicated CSS
import "./ClassSection.css";

const ClassSection = ({
  isExpanded,
  selectedClass,
  onSelect,
  onHeaderClick,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects/classes/all`);
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
    }
  };

  const handleAddClass = async (inputValue = "") => {
    const result = await Swal.fire({
      title: "Add New Class",
      input: "text",
      inputValue: inputValue,
      inputPlaceholder: "e.g. 9th Class",
      showCancelButton: true,
      confirmButtonText: "Add Class",
      cancelButtonText: "Cancel",
      background: "var(--card-bg)",
      color: "var(--text-main)",
      inputValidator: (val) => !val && "Class Name is required!",
    });

    if (result.isConfirmed && result.value) {
      try {
        await axios.post(`${BASE_URL}/api/subjects/classes/add`, {
          name: result.value,
        });
        toast.success("Class Added Successfully");
        fetchClasses();
      } catch (err) {
        toast.error("Failed to add class");
      }
    }
  };

  const handleEdit = async (e, cls) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Edit Class Name",
      input: "text",
      inputValue: cls.name,
      showCancelButton: true,
      confirmButtonText: "Update",
      background: "var(--card-bg)",
      color: "var(--text-main)",
      inputValidator: (val) => !val && "Class Name is required!",
    });

    if (result.isConfirmed && result.value && result.value !== cls.name) {
      try {
        await axios.put(`${BASE_URL}/api/subjects/classes/${cls._id}`, {
          name: result.value,
        });
        toast.success("Class Updated");
        fetchClasses();
      } catch (err) {
        toast.error("Failed to update");
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: "Delete Class?",
      text: "This deletes all contained subjects!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
      background: "var(--card-bg)",
      color: "var(--text-main)",
    });

    if (res.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/subjects/classes/${id}`);
        toast.success("Class Deleted");
        fetchClasses();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  if (!isExpanded) {
    return (
      <div className="section-header collapsed" onClick={onHeaderClick}>
        <div className="d-flex align-items-center gap-3">
          <div className="step-badge done">
            <FaCheck />
          </div>
          <div>
            <h6 className="m-0 text-muted small text-uppercase">Class Level</h6>
            <h5 className="m-0 fw-bold text-main">{selectedClass?.name}</h5>
          </div>
        </div>
        <FaChevronDown className="text-muted" />
      </div>
    );
  }

  return (
    <div className="section-card expanded">
      <div className="section-title text-main">
        <FaLayerGroup className="text-accent me-2" /> Select Class Level
      </div>

      {/* ✅ GRID FIX: 
         - col-xl-3 (Big Screens): 4 in a row
         - col-lg-3 (Laptops): 4 in a row
         - col-md-6 (Tablets): 2 in a row
         - g-4: Gap between cards
         - w-100: Ensure row takes full width
      */}
      <div className="row g-4 w-100 m-0">
        {/* ADD CARD */}
        <div className="col-xl-3 col-lg-3 col-md-6 col-12">
          <div className="add-card-btn h-100" onClick={() => handleAddClass()}>
            <div className="icon-circle">
              <FaPlus />
            </div>
            <span className="fw-bold mt-3 text-accent">Add Class</span>
          </div>
        </div>

        {/* CLASS CARDS */}
        {classes.map((cls, index) => (
          <div key={cls._id} className="col-xl-3 col-lg-3 col-md-6 col-12">
            <div
              className={`class-card grad-${index % 6} h-100`}
              onClick={() => onSelect(cls)}
            >
              {/* Actions (Edit/Delete) */}
              <div className="class-actions">
                <button
                  className="class-btn"
                  onClick={(e) => handleEdit(e, cls)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  className="class-btn"
                  onClick={(e) => handleDelete(e, cls._id)}
                  title="Delete"
                >
                  <FaTrashAlt />
                </button>
              </div>

              {/* Icon */}
              <div className="class-icon-circle">
                <FaLayerGroup />
              </div>

              {/* Name */}
              <h5>{cls.name}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassSection;
