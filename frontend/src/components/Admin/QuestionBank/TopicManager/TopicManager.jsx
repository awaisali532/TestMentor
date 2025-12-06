import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./TopicManager.css";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaListUl,
  FaLayerGroup,
} from "react-icons/fa";

const TopicManager = ({ chapterId }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    topicNumber: "",
    name: "",
    description: "",
  });

  // --- LOGIC: Button Disable kab karna hai? ---
  // Agar Topic Number ya Name khali hai, to isFormValid false ho jayega
  const isFormValid =
    formData.topicNumber.trim() !== "" && formData.name.trim() !== "";

  useEffect(() => {
    if (chapterId) fetchTopics();
  }, [chapterId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/topics/chapter/${chapterId}`
      );
      setTopics(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();

    // 1. SPECIFIC ERROR MESSAGES
    if (!formData.topicNumber) return toast.error("Please enter Topic Number!");
    if (!formData.name) return toast.error("Please enter Topic Name!");

    if (!chapterId) return toast.error("System Error: Chapter not selected.");

    try {
      await axios.post(`${BASE_URL}/api/topics/add`, {
        chapterId,
        ...formData,
      });

      toast.success("Topic Added Successfully!");
      setFormData({ topicNumber: "", name: "", description: "" });
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error adding topic");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Topic?",
      text: "This will remove related questions!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/topics/${id}`);
        toast.success("Topic Deleted");
        fetchTopics();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleEdit = async (topic) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Topic",
      html: `<div class="text-start">
            <label class="small fw-bold mb-1">Topic No. <span class="text-danger">*</span></label>
            <input id="swal-topic-no" class="form-control mb-2" value="${
              topic.topicNumber
            }">
            
            <label class="small fw-bold mb-1">Topic Name <span class="text-danger">*</span></label>
            <input id="swal-topic-name" class="form-control mb-2" value="${
              topic.name
            }">
            
            <label class="small fw-bold mb-1">Description</label>
            <textarea id="swal-topic-desc" class="form-control" rows="2">${
              topic.description || ""
            }</textarea>
         </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Topic",
      preConfirm: () => {
        return {
          topicNumber: document.getElementById("swal-topic-no").value,
          name: document.getElementById("swal-topic-name").value,
          description: document.getElementById("swal-topic-desc").value,
        };
      },
    });

    if (formValues) {
      if (!formValues.topicNumber || !formValues.name)
        return toast.error("Number and Name cannot be empty");

      try {
        await axios.put(`${BASE_URL}/api/topics/${topic._id}`, formValues);
        toast.success("Topic Updated!");
        fetchTopics();
      } catch (err) {
        toast.error(err.response?.data?.error || "Update Failed");
      }
    }
  };

  return (
    <div className="row g-4">
      {/* LEFT: LIST */}
      <div className="col-md-7">
        <div className="d-flex align-items-center mb-3 text-primary">
          <FaListUl className="me-2 fs-5" />
          <h5 className="m-0 fw-bold">Existing Topics</h5>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">Loading topics...</div>
        ) : (
          <div className="list-group shadow-sm">
            {topics.length === 0 ? (
              <div className="text-center p-5 bg-light rounded border border-dashed">
                <FaLayerGroup className="text-muted fs-1 mb-2 opacity-50" />
                <p className="text-muted m-0">
                  No topics found in this chapter.
                </p>
                <small className="text-muted">Use the form to add one.</small>
              </div>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic._id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 topic-list-item"
                >
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary rounded-pill me-3 topic-badge">
                      {topic.topicNumber}
                    </span>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">{topic.name}</h6>
                      {topic.description && (
                        <small className="text-muted">
                          {topic.description}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(topic)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(topic._id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT: ADD FORM */}
      <div className="col-md-5">
        <div className="card add-topic-card bg-white">
          <div className="card-header bg-primary text-white py-3">
            <h6 className="m-0 fw-bold d-flex align-items-center">
              <FaPlus className="me-2" /> Add New Topic
            </h6>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleAddTopic}>
              <div className="row mb-3">
                <div className="col-4">
                  {/* RED ASTERISK ADDED */}
                  <label className="form-label small fw-bold text-secondary">
                    Number <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1.1"
                    value={formData.topicNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, topicNumber: e.target.value })
                    }
                  />
                </div>
                <div className="col-8">
                  {/* RED ASTERISK ADDED */}
                  <label className="form-label small fw-bold text-secondary">
                    Topic Name <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Introduction"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Short details about this topic..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>

              {/* BUTTON DISABLE LOGIC */}
              <button
                type="submit"
                className={`btn w-100 fw-bold py-2 shadow-sm ${
                  isFormValid ? "btn-primary" : "btn-secondary"
                }`}
                disabled={!isFormValid} // Agar form valid nahi to button disable
                style={{ cursor: isFormValid ? "pointer" : "not-allowed" }}
              >
                <FaPlus className="me-2" /> Save Topic
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicManager;
