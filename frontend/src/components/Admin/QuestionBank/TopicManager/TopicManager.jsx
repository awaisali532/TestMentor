import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // ✅ Toaster included
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
  FaSave,
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

  // ✅ Form Data now has both English and Urdu
  const [formData, setFormData] = useState({
    topicNumber: "",
    name: { en: "", ur: "" },
  });

  // --- EFFECT: Load Topics ---
  useEffect(() => {
    if (chapterId) fetchTopics();
  }, [chapterId]);

  // --- API: Fetch Topics ---
  const fetchTopics = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/topics/chapter/${chapterId}`
      );
      setTopics(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topics");
    }
  };

  // --- HANDLERS: Input Changes ---
  const handleSimpleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLangInput = (lang, value) => {
    setFormData({
      ...formData,
      name: { ...formData.name, [lang]: value },
    });
  };

  // --- ACTION: Populate Edit Form ---
  const handleEditClick = (topic) => {
    setEditingId(topic._id);
    setMode("single");

    // ✅ Logic to handle both Object {en, ur} and Old String format
    const enName = typeof topic.name === "object" ? topic.name.en : topic.name;
    const urName = typeof topic.name === "object" ? topic.name.ur : "";

    setFormData({
      topicNumber: topic.topicNumber,
      name: { en: enName, ur: urName },
    });

    // Scroll to form
    document
      .querySelector(".add-topic-card")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ topicNumber: "", name: { en: "", ur: "" } });
  };

  // --- 1. ADD / UPDATE SINGLE TOPIC ---
  const handleSubmitSingle = async (e) => {
    e.preventDefault();

    // Validation: Number and English Name are mandatory
    if (!formData.topicNumber || !formData.name.en) {
      return toast.error("Topic Number and English Name are required!");
    }

    if (!chapterId) return toast.error("System Error: Chapter not selected.");

    setLoading(true);
    const toastId = toast.loading(
      editingId ? "Updating Topic..." : "Saving Topic..."
    );

    try {
      const payload = {
        chapterId,
        topicNumber: formData.topicNumber,
        name: formData.name, // Sends { en: "...", ur: "..." }
      };

      if (editingId) {
        await axios.put(`${BASE_URL}/api/topics/${editingId}`, payload);
        toast.success("Topic Updated Successfully!", { id: toastId });
        setEditingId(null);
      } else {
        await axios.post(`${BASE_URL}/api/topics/add`, payload);
        toast.success("Topic Added Successfully!", { id: toastId });
      }

      // Reset & Refresh
      setFormData({ topicNumber: "", name: { en: "", ur: "" } });
      fetchTopics();
    } catch (err) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.error || "Operation Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. BULK UPLOAD ---
  const handleBulkUpload = async () => {
    if (!bulkJson) return toast.error("Please paste JSON data first.");

    setLoading(true);
    const toastId = toast.loading("Uploading Bulk Topics...");

    try {
      const parsedData = JSON.parse(bulkJson);

      if (!Array.isArray(parsedData)) {
        setLoading(false);
        toast.dismiss(toastId);
        return toast.error("Invalid Format! Must be an Array [ ... ]");
      }

      // ✅ Map JSON to Backend Schema
      const bulkPayload = parsedData.map((item) => ({
        chapter: chapterId,
        topicNumber: item.topicNumber,
        name: {
          en: item.nameEn || item.name,
          ur: item.nameUr || "",
        },
      }));

      const res = await axios.post(`${BASE_URL}/api/topics/add-bulk`, {
        topics: bulkPayload,
      });

      toast.success(res.data.message || "Bulk Upload Complete!", {
        id: toastId,
      });
      setBulkJson("");
      setMode("single");
      fetchTopics();
    } catch (err) {
      toast.dismiss(toastId);
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON Syntax!");
      } else {
        const msg = err.response?.data?.error || "Bulk Upload Failed";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. DELETE TOPIC ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Topic?",
      text: "This will remove all related questions!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete!",
    });

    if (result.isConfirmed) {
      setLoading(true);
      const toastId = toast.loading("Deleting...");
      try {
        await axios.delete(`${BASE_URL}/api/topics/${id}`);
        toast.success("Topic Deleted", { id: toastId });
        fetchTopics();
      } catch (err) {
        toast.dismiss(toastId);
        toast.error("Failed to delete");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="row g-4">
      {/* ✅ Local Toaster ensures notifications appear */}
      <Toaster position="top-right" />

      {/* LEFT: LIST DISPLAY */}
      <div className="col-md-7">
        <div className="d-flex align-items-center mb-3 text-primary">
          <FaListUl className="me-2 fs-5" />
          <h5 className="m-0 fw-bold">Existing Topics</h5>
        </div>

        <div
          className="list-group shadow-sm"
          style={{ maxHeight: "600px", overflowY: "auto" }}
        >
          {topics.length === 0 ? (
            <div className="text-center p-5 bg-light rounded border border-dashed">
              <FaLayerGroup className="text-muted fs-1 mb-2 opacity-50" />
              <p className="text-muted m-0">No topics found.</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic._id}
                className={`list-group-item d-flex justify-content-between align-items-center p-3 topic-list-item ${
                  editingId === topic._id
                    ? "bg-light border-start border-primary border-4"
                    : ""
                }`}
              >
                <div className="d-flex align-items-center">
                  <span
                    className="badge bg-primary rounded-pill me-3"
                    style={{ minWidth: "50px" }}
                  >
                    {topic.topicNumber}
                  </span>
                  <div>
                    {/* ENGLISH NAME */}
                    <span className="fw-bold text-dark me-2">
                      {typeof topic.name === "object"
                        ? topic.name.en
                        : topic.name}
                    </span>

                    {/* URDU NAME (Shown in brackets) */}
                    {topic.name?.ur && (
                      <span className="urdu-font text-secondary">
                        ({topic.name.ur})
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => handleEditClick(topic)}
                    disabled={loading}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(topic._id)}
                    disabled={loading}
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: ADD/EDIT FORM */}
      <div className="col-md-5">
        <div
          className="card add-topic-card bg-white sticky-top shadow-sm border-0"
          style={{ top: "20px" }}
        >
          {/* Form Header */}
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold text-primary d-flex align-items-center">
              {editingId ? (
                <>
                  <FaEdit className="me-2" /> Edit Topic
                </>
              ) : (
                <>
                  <FaPlus className="me-2" /> Add Topic
                </>
              )}
            </h6>

            {/* Toggle Single/Bulk */}
            {!editingId && (
              <div className="d-flex bg-light p-1 rounded">
                <button
                  className={`btn btn-xs px-2 ${
                    mode === "single"
                      ? "bg-white shadow-sm fw-bold"
                      : "text-muted"
                  }`}
                  onClick={() => setMode("single")}
                  disabled={loading}
                >
                  Single
                </button>
                <button
                  className={`btn btn-xs px-2 ${
                    mode === "bulk"
                      ? "bg-white shadow-sm fw-bold"
                      : "text-muted"
                  }`}
                  onClick={() => setMode("bulk")}
                  disabled={loading}
                >
                  Bulk
                </button>
              </div>
            )}
          </div>

          <div className="card-body p-4">
            {mode === "single" ? (
              // --- SINGLE MODE FORM ---
              <form onSubmit={handleSubmitSingle}>
                {editingId && (
                  <div className="alert alert-warning py-1 d-flex justify-content-between align-items-center small mb-3">
                    <span>Editing Mode Active</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-light py-0"
                      onClick={handleCancelEdit}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-4">
                    <label className="form-label small fw-bold text-secondary">
                      No.<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="topicNumber"
                      placeholder="1.1"
                      value={formData.topicNumber}
                      onChange={handleSimpleInput}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-8">
                    <label className="form-label small fw-bold text-secondary">
                      English Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Introduction"
                      value={formData.name.en}
                      onChange={(e) => handleLangInput("en", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary">
                    Urdu Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control urdu-font"
                    placeholder="تعارف"
                    value={formData.name.ur}
                    onChange={(e) => handleLangInput("ur", e.target.value)}
                    dir="rtl"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className={`btn w-100 fw-bold py-2 ${
                    editingId ? "btn-warning text-white" : "btn-primary"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="icon-spin me-2" /> Processing...
                    </>
                  ) : (
                    <>{editingId ? "Update Topic" : "Save Topic"}</>
                  )}
                </button>
              </form>
            ) : (
              // --- BULK MODE FORM ---
              <div>
                <h6 className="small fw-bold text-muted">JSON Format:</h6>
                <div
                  className="bg-dark text-white p-2 rounded mb-2 small"
                  style={{ fontFamily: "monospace", fontSize: "11px" }}
                >
                  [<br />
                  &nbsp;&nbsp;{`{`}"topicNumber": "1.1", "nameEn": "Intro",
                  "nameUr": "تعارف"{`}`},<br />
                  &nbsp;&nbsp;...
                  <br />]
                </div>
                <textarea
                  className="form-control mb-3"
                  rows="6"
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                  placeholder="Paste JSON here..."
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  disabled={loading}
                ></textarea>

                <button
                  className="btn btn-primary w-100 fw-bold d-flex justify-content-center align-items-center"
                  onClick={handleBulkUpload}
                  disabled={loading || !bulkJson}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="icon-spin me-2" /> Uploading...
                    </>
                  ) : (
                    <>
                      <FaCode className="me-2" /> Upload Bulk
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
