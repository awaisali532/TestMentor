import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaLayerGroup,
  FaClock,
  FaBook,
} from "react-icons/fa";
import toast from "react-hot-toast";
import PatternForm from "./PatternForm";
import "./PaperPatterns.css";
import TMLoader from "../../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";

const PaperPatterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/patterns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatterns(res.data);
    } catch (err) {
      toast.error("Failed to load patterns");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrigger = (id) => setDeleteModal({ isOpen: true, id });

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/patterns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Pattern Deleted!");
      fetchPatterns();
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
    fetchPatterns();
  };

  return (
    <div className="pp-container">
      {loading && <TMLoader />}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Pattern?"
        message="Are you sure? This will remove the blueprint permanently."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      {showForm ? (
        <PatternForm onClose={handleFormClose} initialData={editData} />
      ) : (
        <>
          <div className="pp-header">
            <div>
              <h2 className="pp-title">Paper Patterns</h2>
              <p className="text-muted">Manage Board & Custom Blueprints</p>
            </div>
            <button className="pp-btn-add" onClick={() => setShowForm(true)}>
              <FaPlus /> Create New Pattern
            </button>
          </div>

          <div className="pp-grid">
            {patterns.length === 0 && !loading ? (
              <div className="text-center w-100 text-muted p-5">
                No patterns found. Create one to get started.
              </div>
            ) : (
              patterns.map((p) => (
                <div key={p._id} className="pp-card">
                  <div className="pp-card-header">
                    <span
                      className={`pp-badge ${p.isPairingSpecific ? "badge-full" : "badge-custom"}`}
                    >
                      {p.isPairingSpecific
                        ? "Strict Pairing"
                        : "Flexible Structure"}
                    </span>
                    <div className="pp-card-actions-top">
                      <button
                        className="pp-action-btn btn-edit"
                        onClick={() => handleEdit(p)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="pp-action-btn btn-delete"
                        onClick={() => handleDeleteTrigger(p._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <h3 className="pp-card-title">{p.name}</h3>

                  <div className="pp-card-info">
                    <span>
                      <FaLayerGroup className="me-1" /> {p.gradeLevel}
                    </span>
                    <span>
                      <FaBook className="me-1" /> {p.subject?.name || "Subject"}
                    </span>
                    <span>
                      <FaClock className="me-1" /> {p.timeAllowed}
                    </span>
                  </div>

                  <div className="pp-card-structure">
                    <strong>Structure:</strong> {p.sections?.length || 0}{" "}
                    Questions
                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">Total Marks</small>
                      <strong className="text-accent">{p.totalMarks}</strong>
                    </div>
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
