import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
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

// ✅ Import dedicated CSS
import "./SubjectSection.css";

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: "",
    year: "2025-2026",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isExpanded && selectedClass) fetchSubjects();
  }, [isExpanded, selectedClass]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`);
      setSubjects(res.data.filter((s) => s.className === selectedClass.name));
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleEdit = (e, subject) => {
    e.stopPropagation();
    setEditingId(subject._id);
    setFormData({ subjectName: subject.subjectName, year: subject.year });
    setPreview(subject.image?.url || null);
    setFile(null);
    setShowForm(true);
    setIsEditing(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Delete Subject?",
      text: "This deletes all chapters inside!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
      background: "var(--card-bg)",
      color: "var(--text-main)",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName) return toast.error("Name is required");
    setLoading(true);

    const data = new FormData();
    data.append("subjectName", formData.subjectName);
    data.append("className", selectedClass.name);
    data.append("year", formData.year);
    if (file) data.append("image", file);

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/subjects/${editingId}`, data);
        toast.success("Updated!");
      } else {
        await axios.post(`${BASE_URL}/api/subjects/add`, data);
        toast.success("Added!");
      }
      resetForm();
      fetchSubjects();
    } catch (err) {
      const msg = err.response?.data?.error || "Operation Failed";
      toast.error(msg);
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
            <h5 className="m-0 fw-bold text-main">
              {selectedSubject?.subjectName}
            </h5>
          </div>
        </div>
        <FaChevronDown className="text-muted" />
      </div>
    );
  }

  return (
    <div className="section-card expanded">
      {/* HEADER */}
      <div className="section-title d-flex justify-content-between align-items-center">
        <span>
          <FaBook className="text-accent me-2" /> Subjects for{" "}
          <span className="text-accent">{selectedClass?.name}</span>
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
        // --- FORM VIEW ---
        <div className="subject-form-container">
          <h6 className="fw-bold mb-4 text-main">
            {editingId ? "Edit Subject" : "Add New Subject"}
          </h6>

          <div className="row g-4">
            {/* Left: Image Upload */}
            <div className="col-md-4">
              <label className="upload-box" htmlFor="subImgInput">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="upload-preview-img"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <FaCloudUploadAlt />
                    <p className="m-0 small fw-bold">Upload Cover</p>
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
                <label className="form-label">Subject Name</label>
                <input
                  className="form-control custom-input"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInput}
                  placeholder="e.g. Physics"
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Academic Year</label>
                <input
                  className="form-control custom-input"
                  name="year"
                  value={formData.year}
                  onChange={handleInput}
                  disabled={loading}
                />
              </div>

              <button
                className="btn-primary-gradient w-100"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="icon-spin me-2" /> Processing...
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
        // --- GRID VIEW ---
        <div className="row g-4">
          {/* Add New Card */}
          <div className="col-md-3">
            <div className="add-subject-btn" onClick={() => setShowForm(true)}>
              <div className="add-icon-circle">
                <FaPlus />
              </div>
              <span className="add-text">Add Subject</span>
            </div>
          </div>

          {/* Existing Subjects */}
          {subjects.map((sub) => (
            <div key={sub._id} className="col-md-3">
              <div className="subject-card" onClick={() => onSelect(sub)}>
                {/* Actions */}
                <div className="subject-actions">
                  <button
                    className="action-btn-circle edit"
                    onClick={(e) => handleEdit(e, sub)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn-circle delete"
                    onClick={(e) => handleDelete(e, sub._id)}
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                {/* Image */}
                <div className="subject-img-container">
                  {sub.image?.url ? (
                    <img
                      src={sub.image.url}
                      alt={sub.subjectName}
                      className="subject-img"
                    />
                  ) : (
                    <FaBook className="subject-icon-placeholder" />
                  )}
                </div>

                {/* Info */}
                <div className="subject-info text-center">
                  <h5>{sub.subjectName}</h5>
                  <small>{sub.year}</small>
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
