import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Kept only for Inputs (Add/Edit)
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

// ✅ Import TMLoader
import TMLoader from "../../../../components/common/TMLoader/TMLoader";

// ✅ Import Custom Confirmation Modal
import ConfirmationModal from "../../../../components/common/ConfirmationModal/ConfirmationModal";

const ClassSection = ({
  isExpanded,
  selectedClass,
  onSelect,
  onHeaderClick,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Modal State for Delete
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects/classes/all`);
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  // --- ADD CLASS (Uses Swal for Input) ---
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
      setLoading(true);
      try {
        await axios.post(`${BASE_URL}/api/subjects/classes/add`, {
          name: result.value,
        });
        toast.success("Class Added Successfully");
        fetchClasses();
      } catch (err) {
        toast.error("Failed to add class");
        setLoading(false);
      }
    }
  };

  // --- EDIT CLASS (Uses Swal for Input) ---
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
      setLoading(true);
      try {
        await axios.put(`${BASE_URL}/api/subjects/classes/${cls._id}`, {
          name: result.value,
        });
        toast.success("Class Updated");
        fetchClasses();
      } catch (err) {
        toast.error("Failed to update");
        setLoading(false);
      }
    }
  };

  // --- DELETE CLASS (Uses Custom Modal) ---
  const handleDeleteTrigger = (e, id) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      id: id,
      title: "Delete Class?",
      message: "This deletes all contained subjects! Action cannot be undone.",
    });
  };

  const handleConfirmDelete = async () => {
    const idToDelete = deleteModal.id;
    setDeleteModal({ ...deleteModal, isOpen: false }); // Close modal
    setLoading(true);

    try {
      await axios.delete(`${BASE_URL}/api/subjects/classes/${idToDelete}`);
      toast.success("Class Deleted");
      fetchClasses();
    } catch (err) {
      toast.error("Failed to delete");
      setLoading(false);
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
    <>
      {loading && <TMLoader />}

      {/* ✅ Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      <div className="section-card expanded">
        <div className="section-title text-main">
          <FaLayerGroup className="text-accent me-2" /> Select Class Level
        </div>

        <div className="row g-4 w-100 m-0">
          {/* ADD CARD */}
          <div className="col-xl-3 col-lg-3 col-md-6 col-12">
            <div
              className="add-card-btn h-100"
              onClick={() => handleAddClass()}
            >
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
                  {/* ✅ Updated Delete Trigger */}
                  <button
                    className="class-btn"
                    onClick={(e) => handleDeleteTrigger(e, cls._id)}
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
    </>
  );
};

export default ClassSection;
