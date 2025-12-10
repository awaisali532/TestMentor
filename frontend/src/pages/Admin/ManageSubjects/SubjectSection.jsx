import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaBook,
  FaPlus,
  FaCloudUploadAlt,
  FaCheck,
  FaChevronDown,
  FaTrashAlt,
  FaArrowLeft,
  FaEdit,
  FaSpinner,
  FaSave,
} from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert for delete confirmation

const SubjectSection = ({
  isExpanded,
  selectedClass,
  selectedSubject,
  onSelect,
  onHeaderClick,
  setIsEditing,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loading State Added

  // Form State
  const [formData, setFormData] = useState({
    subjectName: "",
    year: "2025-2026",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null); // ✅ Track ID if Editing

  useEffect(() => {
    if (isExpanded && selectedClass) fetchSubjects();
  }, [isExpanded, selectedClass]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`);
      const filtered = res.data.filter(
        (s) => s.className === selectedClass.name
      );
      setSubjects(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLERS ---

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsEditing(true);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setIsEditing(true);
    }
  };

  // ✅ EDIT HANDLER
  const handleEdit = (e, subject) => {
    e.stopPropagation(); // Card open hone se roken
    setEditingId(subject._id);
    setFormData({ subjectName: subject.subjectName, year: subject.year });
    setPreview(subject.image?.url || null);
    setFile(null); // File reset (agar user change na kare to purani rahe)
    setShowForm(true);
    setIsEditing(true);
  };

  // ✅ DELETE HANDLER
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Delete Subject?",
      text: "All chapters inside this subject will also be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/subjects/${id}`);
        toast.success("Subject Deleted");
        fetchSubjects();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  // ✅ SUBMIT HANDLER (Add & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName) return toast.error("Subject Name is required");
    // Add mode mein image lazmi hai, Edit mode mein optional hai
    if (!editingId && !file)
      return toast.error("Image is required for new subject");

    setLoading(true); // Button disable start

    const data = new FormData();
    data.append("subjectName", formData.subjectName);
    data.append("className", selectedClass.name);
    data.append("year", formData.year);
    if (file) data.append("image", file);

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/subjects/${editingId}`, data);
        toast.success("Subject Updated Successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/subjects/add`, data);
        toast.success("Subject Added Successfully!");
      }
      resetForm();
      fetchSubjects();
    } catch (err) {
      console.error(err);

      // 👇 UPDATED ERROR LOGIC
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Operation failed";

      if (errorMsg.includes("duplicate") || errorMsg.includes("E11000")) {
        // Check what exactly is duplicate based on context
        toast.error("This Subject already exists in this Class/Year!");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ subjectName: "", year: "2025-2026" });
    setFile(null);
    setPreview(null);
  };

  // --- RENDER ---

  // 1. COLLAPSED VIEW
  if (!isExpanded) {
    return (
      <div className="section-header collapsed" onClick={onHeaderClick}>
        <div className="d-flex align-items-center gap-3">
          <div className="step-badge done">
            <FaCheck />
          </div>
          <div>
            <h6 className="m-0 text-muted small text-uppercase">
              Step 2: Subject
            </h6>
            <h5 className="m-0 fw-bold text-dark">
              {selectedSubject?.subjectName}
            </h5>
          </div>
        </div>
        <FaChevronDown className="text-muted" />
      </div>
    );
  }

  // 2. EXPANDED VIEW
  return (
    <div className="section-card expanded">
      <div className="section-title d-flex justify-content-between align-items-center">
        <span>
          <FaBook className="text-primary me-2" />
          Subjects for{" "}
          <span className="text-primary">{selectedClass?.name}</span>
        </span>
        {showForm && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={resetForm}
            disabled={loading}
          >
            <FaArrowLeft className="me-1" /> Cancel
          </button>
        )}
      </div>

      {showForm ? (
        // --- ADD / EDIT FORM ---
        <div className="p-4 border rounded bg-light">
          <h6 className="fw-bold mb-3 text-secondary">
            {editingId ? "Edit Subject" : "Add New Subject"}
          </h6>

          <div className="row">
            {/* Left: Image Upload */}
            <div className="col-md-4">
              <label className="image-upload-box" htmlFor="subImgInput">
                {preview ? (
                  <img src={preview} alt="Preview" />
                ) : (
                  <div className="text-center text-muted">
                    <FaCloudUploadAlt size={30} className="mb-2" />
                    <p className="m-0 small">Click to Upload</p>
                  </div>
                )}
              </label>
              <input
                id="subImgInput"
                type="file"
                hidden
                onChange={handleFile}
                accept="image/*"
                disabled={loading}
              />
            </div>

            {/* Right: Inputs */}
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label fw-bold small">Subject Name</label>
                <input
                  className="form-control"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInput}
                  placeholder="e.g. Physics"
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold small">
                  Academic Year
                </label>
                <input
                  className="form-control"
                  name="year"
                  value={formData.year}
                  onChange={handleInput}
                  disabled={loading}
                />
              </div>

              {/* ✅ PROFESSIONAL BUTTON WITH LOADING STATE */}
              <button
                className={`btn w-100 fw-bold d-flex align-items-center justify-content-center ${
                  editingId ? "btn-warning text-white" : "btn-success"
                }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="icon-spin me-2" />
                    {editingId ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <FaSave className="me-2" />
                    ) : (
                      <FaPlus className="me-2" />
                    )}
                    {editingId ? "Update Subject" : "Save Subject"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- SUBJECT GRID ---
        <div className="row g-3">
          {/* Add New Card */}
          <div className="col-md-3">
            <div
              className="add-card-btn h-100"
              onClick={() => setShowForm(true)}
            >
              <div className="icon-circle bg-light text-success mb-2">
                <FaPlus />
              </div>
              <span className="fw-bold text-success">Add Subject</span>
            </div>
          </div>

          {/* Existing Subjects */}
          {subjects.map((sub) => (
            <div key={sub._id} className="col-md-3">
              <div className="selection-card" onClick={() => onSelect(sub)}>
                {/* ✅ HOVER ACTIONS (Edit / Delete) */}
                <div className="card-actions">
                  <button
                    className="icon-btn text-warning"
                    title="Edit"
                    onClick={(e) => handleEdit(e, sub)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="icon-btn text-danger"
                    title="Delete"
                    onClick={(e) => handleDelete(e, sub._id)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                {/* Image Area */}
                {sub.image?.url ? (
                  <img
                    src={sub.image.url}
                    alt={sub.subjectName}
                    className="card-img-top-custom"
                  />
                ) : (
                  <div className="icon-box bg-green-light text-green mb-3">
                    <FaBook size={24} />
                  </div>
                )}

                <div className="mt-auto">
                  <h5 className="fw-bold m-0 text-dark">{sub.subjectName}</h5>
                  <small className="text-muted">{sub.year}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectSection;
