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

  // --- ADD NEW CLASS (With Confirm on Exit) ---
  const handleAddClass = async (inputValue = "") => {
    const result = await Swal.fire({
      title: "Add New Class",
      input: "text",
      inputValue: inputValue, // Purana value yad rakhe ga
      inputPlaceholder: "e.g. 9th Class",
      showCancelButton: true,
      confirmButtonText: "Add Class",
      cancelButtonText: "Cancel",
      allowOutsideClick: true, // Bahir click allowed hai
      inputValidator: (val) => !val && "Class Name is required!",
    });

    // 1. Agar user ne Bahir Click kia
    if (result.dismiss === Swal.DismissReason.backdrop) {
      const confirm = await Swal.fire({
        title: "Unsaved Changes!",
        text: "Do you want to discard changes and exit?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Exit",
        cancelButtonText: "No, Keep Editing",
        confirmButtonColor: "#d33",
      });

      // Agar "No" bola to wapis form khul jaye ga
      if (!confirm.isConfirmed) {
        handleAddClass(inputValue); // Wapis kholo
        return;
      }
    }

    // 2. Agar Add Button Click kia
    if (result.isConfirmed && result.value) {
      try {
        await axios.post(`${BASE_URL}/api/subjects/classes/add`, {
          name: result.value,
        });
        toast.success("Class Added Successfully");
        fetchClasses();
      } catch (err) {
        // 👇 UPDATED ERROR LOGIC
        const errorMsg =
          err.response?.data?.error || err.response?.data?.message || "Failed";
        if (errorMsg.includes("duplicate") || errorMsg.includes("E11000")) {
          toast.error(`Class "${result.value}" already exists!`);
        } else {
          toast.error(errorMsg);
        }
      }
    }
  };

  // --- EDIT CLASS (With Confirm on Exit) ---
  const handleEdit = async (e, cls) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Edit Class Name",
      input: "text",
      inputValue: cls.name,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      allowOutsideClick: true, // Bahir click allowed
      inputValidator: (val) => !val && "Class Name is required!",
    });

    // 1. Agar user ne Bahir Click kia (Backdrop)
    if (result.dismiss === Swal.DismissReason.backdrop) {
      const confirm = await Swal.fire({
        title: "Unsaved Changes!",
        text: "You are editing. Do you really want to exit?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Exit",
        cancelButtonText: "No, Keep Editing",
        confirmButtonColor: "#d33",
      });

      // Agar "No" bola to wapis form khul jaye ga
      if (!confirm.isConfirmed) {
        handleEdit(e, cls); // Wapis kholo (Recursion)
        return;
      }
    }

    // 2. Agar Update Click kia
    if (result.isConfirmed && result.value && result.value !== cls.name) {
      try {
        await axios.put(`${BASE_URL}/api/subjects/classes/${cls._id}`, {
          name: result.value,
        });
        toast.success("Class Name Updated");
        fetchClasses();
      } catch (err) {
        // 👇 UPDATED ERROR LOGIC
        const errorMsg =
          err.response?.data?.error || err.response?.data?.message || "Failed";
        if (errorMsg.includes("duplicate") || errorMsg.includes("E11000")) {
          toast.error(`Class Name "${result.value}" is already taken!`);
        } else {
          toast.error(errorMsg);
        }
      }
    }
  };

  // --- DELETE CLASS ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();

    const res = await Swal.fire({
      title: "Delete Class?",
      text: "This will also delete all subjects & chapters inside it!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
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

  // --- RENDER ---
  if (!isExpanded) {
    return (
      <div className="section-header collapsed" onClick={onHeaderClick}>
        <div className="d-flex align-items-center gap-3">
          <div className="step-badge done">
            <FaCheck />
          </div>
          <div>
            <h6 className="m-0 text-muted small text-uppercase">Class Level</h6>
            <h5 className="m-0 fw-bold text-dark">{selectedClass?.name}</h5>
          </div>
        </div>
        <FaChevronDown className="text-muted" />
      </div>
    );
  }

  return (
    <div className="section-card expanded">
      <div className="section-title">
        <FaLayerGroup className="text-warning me-2" /> Select Class Level
      </div>

      <div className="row g-3">
        {/* ADD CARD */}
        <div className="col-md-3">
          <div
            className="add-card-btn"
            onClick={() => handleAddClass()}
            style={{ minHeight: "130px" }}
          >
            <div className="icon-circle bg-light text-primary mb-2">
              <FaPlus />
            </div>
            <span className="fw-bold text-primary">Add Class</span>
          </div>
        </div>

        {/* CLASS CARDS */}
        {classes.map((cls, index) => (
          <div key={cls._id} className="col-md-3">
            <div
              className={`class-card grad-${index % 6}`}
              onClick={() => onSelect(cls)}
            >
              <div className="class-actions">
                <button
                  className="class-btn text-warning"
                  title="Edit Name"
                  onClick={(e) => handleEdit(e, cls)}
                >
                  <FaEdit />
                </button>
                <button
                  className="class-btn text-danger"
                  title="Delete Class"
                  onClick={(e) => handleDelete(e, cls._id)}
                >
                  <FaTrashAlt />
                </button>
              </div>

              <div className="class-icon-circle">
                <FaLayerGroup size={22} color="white" />
              </div>

              <h5
                className="fw-bold m-0 text-white text-uppercase"
                style={{ letterSpacing: "1px" }}
              >
                {cls.name}
              </h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassSection;
