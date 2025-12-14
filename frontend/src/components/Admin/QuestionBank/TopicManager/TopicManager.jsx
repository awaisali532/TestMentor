import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "./TopicManager.css";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaListUl,
  FaLayerGroup,
  FaCode,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

const TopicManager = ({ chapterId }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATES ---
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("single"); // 'single' or 'bulk'
  const [editingId, setEditingId] = useState(null);
  const [bulkJson, setBulkJson] = useState("");

  const [formData, setFormData] = useState({
    topicNumber: "",
    name: { en: "", ur: "" },
  });

  // --- EFFECT: Load Topics ---
  useEffect(() => {
    if (chapterId) fetchTopics();
  }, [chapterId]);

  const fetchTopics = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/topics/chapter/${chapterId}`
      );
      setTopics(res.data);
    } catch (err) {
      toast.error("Failed to load topics");
    }
  };

  // --- HANDLERS ---
  const handleSimpleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLangInput = (lang, value) => {
    setFormData({
      ...formData,
      name: { ...formData.name, [lang]: value },
    });
  };

  const handleEditClick = (topic) => {
    setEditingId(topic._id);
    setMode("single");
    const enName = typeof topic.name === "object" ? topic.name.en : topic.name;
    const urName = typeof topic.name === "object" ? topic.name.ur : "";
    setFormData({
      topicNumber: topic.topicNumber,
      name: { en: enName, ur: urName },
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ topicNumber: "", name: { en: "", ur: "" } });
  };

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    if (!formData.topicNumber || !formData.name.en)
      return toast.error("Required fields missing!");

    setLoading(true);
    const toastId = toast.loading(editingId ? "Updating..." : "Saving...");

    try {
      const payload = {
        chapterId,
        topicNumber: formData.topicNumber,
        name: formData.name,
      };
      if (editingId) {
        await axios.put(`${BASE_URL}/api/topics/${editingId}`, payload);
        toast.success("Updated!", { id: toastId });
        setEditingId(null);
      } else {
        await axios.post(`${BASE_URL}/api/topics/add`, payload);
        toast.success("Added!", { id: toastId });
      }
      setFormData({ topicNumber: "", name: { en: "", ur: "" } });
      fetchTopics();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkJson) return toast.error("Paste JSON first.");
    setLoading(true);
    const toastId = toast.loading("Uploading...");
    try {
      const parsedData = JSON.parse(bulkJson);
      const bulkPayload = parsedData.map((item) => ({
        chapter: chapterId,
        topicNumber: item.topicNumber,
        name: { en: item.nameEn || item.name, ur: item.nameUr || "" },
      }));
      await axios.post(`${BASE_URL}/api/topics/add-bulk`, {
        topics: bulkPayload,
      });
      toast.success("Bulk Upload Complete!", { id: toastId });
      setBulkJson("");
      setMode("single");
      fetchTopics();
    } catch (err) {
      toast.error("Upload Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Topic?",
      text: "This removes all related questions!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete!",
      background: "var(--card-bg)", // Theme aware alert
      color: "var(--text-main)",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`${BASE_URL}/api/topics/${id}`);
        toast.success("Deleted");
        fetchTopics();
      } catch (err) {
        toast.error("Failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="row g-4">
      <Toaster position="top-right" />

      {/* LEFT: LIST */}
      <div className="col-md-7">
        <div className="d-flex align-items-center mb-3 text-main">
          <FaListUl className="me-2 text-accent" />
          <h5 className="m-0 fw-bold">Existing Topics</h5>
        </div>

        <div className="topic-list-container custom-scrollbar">
          {topics.length === 0 ? (
            <div className="empty-topic-state">
              <FaLayerGroup />
              <p>No topics found.</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic._id}
                className={`topic-card ${
                  editingId === topic._id ? "active-edit" : ""
                }`}
              >
                <div className="d-flex align-items-center">
                  <span className="topic-badge">{topic.topicNumber}</span>
                  <div>
                    <span className="fw-bold text-main me-2">
                      {typeof topic.name === "object"
                        ? topic.name.en
                        : topic.name}
                    </span>
                    {topic.name?.ur && (
                      <span className="urdu-font text-muted">
                        ({topic.name.ur})
                      </span>
                    )}
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEditClick(topic)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(topic._id)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="col-md-5">
        <div className="form-card sticky-top">
          <div className="form-header">
            <h6 className="m-0 fw-bold text-accent">
              {editingId ? "Edit Topic" : "Add Topic"}
            </h6>
            {!editingId && (
              <div className="mode-toggle">
                <button
                  className={mode === "single" ? "active" : ""}
                  onClick={() => setMode("single")}
                >
                  Single
                </button>
                <button
                  className={mode === "bulk" ? "active" : ""}
                  onClick={() => setMode("bulk")}
                >
                  Bulk
                </button>
              </div>
            )}
          </div>

          <div className="p-4">
            {mode === "single" ? (
              <form onSubmit={handleSubmitSingle}>
                {editingId && (
                  <div className="edit-alert">
                    <span>Editing Mode</span>
                    <button type="button" onClick={handleCancelEdit}>
                      <FaTimes />
                    </button>
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-4">
                    <label className="form-label">No.</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      name="topicNumber"
                      placeholder="1.1"
                      value={formData.topicNumber}
                      onChange={handleSimpleInput}
                    />
                  </div>
                  <div className="col-8">
                    <label className="form-label">English Name</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder="Intro"
                      value={formData.name.en}
                      onChange={(e) => handleLangInput("en", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Urdu Name</label>
                  <input
                    type="text"
                    className="form-control custom-input urdu-font"
                    placeholder="تعارف"
                    value={formData.name.ur}
                    onChange={(e) => handleLangInput("ur", e.target.value)}
                    dir="rtl"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary-gradient w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <FaSpinner className="icon-spin" />
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              </form>
            ) : (
              <div>
                <textarea
                  className="form-control custom-input mb-3"
                  rows="6"
                  placeholder='[{"topicNumber": "1.1", "nameEn": "Intro"}]'
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                ></textarea>
                <button
                  className="btn-primary-gradient w-100"
                  onClick={handleBulkUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <FaSpinner className="icon-spin" />
                  ) : (
                    <>
                      <FaCode className="me-2" /> Upload
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicManager;
