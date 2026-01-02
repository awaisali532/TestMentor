import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import PatternForm from "./PatternForm";
import "./PaperPatterns.css";

// ✅ Import TMLoader & ConfirmationModal
import TMLoader from "../../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";

const PaperPatterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // ✅ State for Delete Confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const savedBackup = localStorage.getItem("pp_form_backup");
    if (savedBackup) setShowForm(true);
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true); // ✅ Start Loader
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/patterns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatterns(res.data);
    } catch (err) {
      toast.error("Failed to load patterns");
    } finally {
      setLoading(false); // ✅ Stop Loader
    }
  };

  // --- DELETE LOGIC (Using Modal) ---
  const handleDeleteTrigger = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null }); // Close Modal
    setLoading(true); // ✅ Show Loader during delete

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/patterns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Preset Deleted Successfully!");
      fetchPatterns(); // Refresh List
    } catch (err) {
      toast.error("Delete failed");
      setLoading(false);
    }
  };

  const handleEdit = (pattern) => {
    setEditData(pattern);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
    localStorage.removeItem("pp_form_backup");
    fetchPatterns();
  };

  return (
    <div className="pp-container">
      {/* ✅ 1. Show TMLoader if loading */}
      {loading && <TMLoader />}

      {/* ✅ 2. Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Preset?"
        message="Are you sure you want to delete this paper pattern? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      {showForm ? (
        <PatternForm onClose={handleFormClose} initialData={editData} />
      ) : (
        <>
          <div className="pp-header">
            <div>
              <h2 className="pp-title">Paper Presets</h2>
              <p className="text-muted">Manage exam blueprints</p>
            </div>
            <button className="pp-btn-add" onClick={() => setShowForm(true)}>
              <FaPlus /> Create New Preset
            </button>
          </div>

          <div className="pp-grid">
            {patterns.length === 0 && !loading ? (
              <div className="text-center w-100 text-muted">
                No presets found.
              </div>
            ) : (
              patterns.map((p) => (
                <div key={p._id} className="pp-card">
                  {/* HEADER WITH BADGE & BUTTONS */}
                  <div className="pp-card-header">
                    <span
                      className={`pp-badge ${
                        p.type === "FULL_BOOK" ? "badge-full" : "badge-custom"
                      }`}
                    >
                      {p.type.replace("_", " ")}
                    </span>

                    {/* ACTIONS */}
                    <div className="pp-card-actions-top">
                      <button
                        className="pp-action-btn btn-edit"
                        onClick={() => handleEdit(p)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="pp-action-btn btn-delete"
                        onClick={() => handleDeleteTrigger(p._id)} // ✅ Trigger Modal
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <h3 className="pp-card-title">{p.presetName}</h3>

                  <div className="pp-card-info">
                    <span>
                      <FaLayerGroup className="me-1" />{" "}
                      {p.gradeLevel.join(", ")}
                    </span>
                    <span>
                      <FaClock className="me-1" /> {p.timeAllowed}
                    </span>
                  </div>

                  <div className="pp-card-structure">
                    <strong>Structure:</strong> {p.sections.length} Sections
                    Defined
                    <br />
                    <small
                      className="text-muted"
                      style={{ display: "block", marginTop: "5px" }}
                    >
                      Total Marks:{" "}
                      <strong style={{ color: "var(--u-accent)" }}>
                        {p.totalMarks}
                      </strong>
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PaperPatterns;
