import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaFolderOpen,
  FaTrashAlt,
  FaPen,
  FaSave,
  FaSpinner,
  FaCode,
  FaTimes,
  FaPlus,
} from "react-icons/fa";

// ✅ Import the new CSS
import "./ChapterSection.css";

const ChapterSection = ({ isExpanded, selectedSubject }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // STATES
  const [chapters, setChapters] = useState([]);
  const [mode, setMode] = useState("single");
  const [bulkJson, setBulkJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newChapter, setNewChapter] = useState({
    number: "",
    name: { en: "", ur: "" },
  });

  useEffect(() => {
    if (isExpanded && selectedSubject) fetchChapters();
  }, [isExpanded, selectedSubject]);

  const fetchChapters = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chapters/subject/${selectedSubject._id}`
      );
      setChapters(res.data);
    } catch (err) {
      toast.error("Failed to load chapters");
    }
  };

  const handleSimpleInput = (e) => {
    setNewChapter({ ...newChapter, [e.target.name]: e.target.value });
  };

  const handleLangInput = (field, lang, value) => {
    setNewChapter({
      ...newChapter,
      [field]: { ...newChapter[field], [lang]: value },
    });
  };

  const handleEditClick = (chapter) => {
    setEditingId(chapter._id);
    setMode("single");
    setNewChapter({
      number: chapter.chapterNumber,
      name: {
        en: typeof chapter.name === "object" ? chapter.name.en : chapter.name,
        ur: typeof chapter.name === "object" ? chapter.name.ur : "",
      },
    });
    // Smooth scroll to form
    document
      .querySelector(".chapter-form-card")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewChapter({ number: "", name: { en: "", ur: "" } });
  };

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    if (!newChapter.number || !newChapter.name.en) {
      return toast.error("Chapter Number and Name required!");
    }
    setLoading(true);
    try {
      const payload = {
        subjectId: selectedSubject._id,
        chapterNumber: newChapter.number,
        name: newChapter.name,
      };
      if (editingId) {
        await axios.put(`${BASE_URL}/api/chapters/${editingId}`, payload);
        toast.success("Updated!");
        setEditingId(null);
      } else {
        await axios.post(`${BASE_URL}/api/chapters/add`, payload);
        toast.success("Added!");
      }
      setNewChapter({ number: "", name: { en: "", ur: "" } });
      fetchChapters();
    } catch (err) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkJson) return toast.error("Paste JSON first.");
    setLoading(true);
    try {
      const parsedData = JSON.parse(bulkJson);
      const bulkPayload = parsedData.map((item) => ({
        subject: selectedSubject._id,
        chapterNumber: item.chapterNumber,
        name: {
          en: item.nameEn || item.name,
          ur: item.nameUr || "",
        },
      }));
      await axios.post(`${BASE_URL}/api/chapters/add-bulk`, {
        chapters: bulkPayload,
      });
      toast.success("Bulk Upload Complete");
      setBulkJson("");
      setMode("single");
      fetchChapters();
    } catch (err) {
      toast.error("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete Chapter?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      background: "var(--card-bg)",
      color: "var(--text-main)",
    });
    if (res.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`${BASE_URL}/api/chapters/${id}`);
        toast.success("Deleted");
        fetchChapters();
      } catch (err) {
        toast.error("Failed");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isExpanded) return null;

  return (
    <div className={`section-card expanded ${loading ? "opacity-75" : ""}`}>
      <Toaster position="top-right" />

      <div className="section-title text-main">
        <FaFolderOpen className="text-accent me-2" /> Chapters for{" "}
        <span className="text-accent ms-2">{selectedSubject?.subjectName}</span>
      </div>

      <div className="row g-4">
        {/* LEFT: LIST */}
        <div className="col-md-7">
          <div className="chapter-list-container custom-scrollbar">
            {chapters.length === 0 && (
              <div className="empty-state">No Chapters Found.</div>
            )}

            {chapters.map((ch) => (
              <div
                key={ch._id}
                className={`chapter-item ${
                  editingId === ch._id ? "active-edit" : ""
                }`}
              >
                <div className="d-flex align-items-center">
                  <span className="chapter-badge">Ch {ch.chapterNumber}</span>
                  <div>
                    <span className="chapter-name-en">
                      {typeof ch.name === "object" ? ch.name.en : ch.name}
                    </span>
                    {ch.name?.ur && (
                      <span className="chapter-name-ur">({ch.name.ur})</span>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="action-icon-btn edit"
                    onClick={() => handleEditClick(ch)}
                    title="Edit"
                  >
                    <FaPen />
                  </button>
                  <button
                    className="action-icon-btn delete"
                    onClick={() => handleDelete(ch._id)}
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="col-md-5">
          <div className="chapter-form-card">
            {/* Header */}
            <div className="form-header">
              <h6 className="form-title">
                {editingId ? "Edit Chapter" : "Add New Chapter"}
              </h6>

              {!editingId && (
                <div className="mode-toggle">
                  <button
                    className={`mode-btn ${mode === "single" ? "active" : ""}`}
                    onClick={() => setMode("single")}
                  >
                    Single
                  </button>
                  <button
                    className={`mode-btn ${mode === "bulk" ? "active" : ""}`}
                    onClick={() => setMode("bulk")}
                  >
                    Bulk
                  </button>
                </div>
              )}
            </div>

            {/* Form Content */}
            {mode === "single" ? (
              <form onSubmit={handleSubmitSingle}>
                {editingId && (
                  <div className="d-flex justify-content-end mb-3">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      <FaTimes /> Cancel Editing
                    </button>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Chapter No.</label>
                  <input
                    className="form-control custom-input"
                    name="number"
                    placeholder="e.g. 1"
                    value={newChapter.number}
                    onChange={handleSimpleInput}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Chapter Name</label>
                  <input
                    className="form-control custom-input mb-2"
                    placeholder="English Name"
                    value={newChapter.name.en}
                    onChange={(e) =>
                      handleLangInput("name", "en", e.target.value)
                    }
                  />
                  <input
                    className="form-control custom-input urdu-font"
                    placeholder="نام (اردو)"
                    dir="rtl"
                    value={newChapter.name.ur}
                    onChange={(e) =>
                      handleLangInput("name", "ur", e.target.value)
                    }
                  />
                </div>

                <button
                  className="btn-primary-gradient w-100 d-flex justify-content-center align-items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="icon-spin me-2" /> Processing...
                    </>
                  ) : editingId ? (
                    <>
                      <FaSave className="me-2" /> Update Chapter
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-2" /> Save Chapter
                    </>
                  )}
                </button>
              </form>
            ) : (
              // BULK MODE
              <div>
                <h6 className="form-label">JSON Format:</h6>
                <div className="json-preview">
                  [<br />
                  &nbsp;&nbsp;
                  {`{ "chapterNumber": "1", "nameEn": "Matrices", "nameUr": "قالب" }`}
                  ,<br />
                  &nbsp;&nbsp;...
                  <br />]
                </div>

                <textarea
                  className="form-control custom-input mb-3"
                  rows="8"
                  placeholder="Paste JSON here..."
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                ></textarea>

                <button
                  className="btn-primary-gradient w-100 d-flex justify-content-center align-items-center"
                  onClick={handleBulkUpload}
                  disabled={loading}
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

export default ChapterSection;
