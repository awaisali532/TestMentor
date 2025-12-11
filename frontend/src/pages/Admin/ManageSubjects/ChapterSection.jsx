import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // ✅ Toaster Added Back
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

const ChapterSection = ({ isExpanded, selectedSubject }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // STATES
  const [chapters, setChapters] = useState([]);
  const [mode, setMode] = useState("single");
  const [bulkJson, setBulkJson] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Data (❌ Description Removed)
  const [newChapter, setNewChapter] = useState({
    number: "",
    name: { en: "", ur: "" },
  });

  useEffect(() => {
    if (isExpanded && selectedSubject) fetchChapters();
  }, [isExpanded, selectedSubject]);

  // API CALLS
  const fetchChapters = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chapters/subject/${selectedSubject._id}`
      );
      setChapters(res.data);
    } catch (err) {
      console.error(err);
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

  // EDIT HANDLER
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
    document.querySelector(".col-md-5")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewChapter({ number: "", name: { en: "", ur: "" } });
  };

  // 1. ADD / UPDATE SINGLE
  const handleSubmitSingle = async (e) => {
    e.preventDefault();

    if (!newChapter.number || !newChapter.name.en) {
      return toast.error("Chapter Number and English Name are required!");
    }

    setLoading(true); // 🔒 BLOCK UI
    const loadingToast = toast.loading(editingId ? "Updating..." : "Saving...");

    try {
      const payload = {
        subjectId: selectedSubject._id,
        chapterNumber: newChapter.number,
        name: newChapter.name,
        // ❌ No Description sent
      };

      if (editingId) {
        await axios.put(`${BASE_URL}/api/chapters/${editingId}`, payload);
        toast.success("Chapter Updated!", { id: loadingToast });
        setEditingId(null);
      } else {
        await axios.post(`${BASE_URL}/api/chapters/add`, payload);
        toast.success("Chapter Added!", { id: loadingToast });
      }

      setNewChapter({ number: "", name: { en: "", ur: "" } });
      fetchChapters();
    } catch (err) {
      toast.dismiss(loadingToast);
      handleErrors(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ADD BULK CHAPTERS ---
  const handleBulkUpload = async () => {
    if (!bulkJson) return toast.error("Please paste JSON data first.");

    setLoading(true);
    const loadingToast = toast.loading("Uploading Bulk Data...");

    try {
      const parsedData = JSON.parse(bulkJson);

      if (!Array.isArray(parsedData)) {
        setLoading(false);
        toast.dismiss(loadingToast);
        return toast.error("Invalid Format! Must be an Array [ ... ]");
      }

      // ✅ Map JSON fields correctly to Backend Schema
      const bulkPayload = parsedData.map((item) => ({
        // 🔴 OLD (Wrong): subjectId: selectedSubject._id,
        // 🟢 NEW (Correct): subject: selectedSubject._id,

        subject: selectedSubject._id, // <--- KEY CHANGED HERE ('subject' matches Database Model)

        chapterNumber: item.chapterNumber,
        name: {
          en: item.nameEn || item.name,
          ur: item.nameUr || "",
        },
      }));

      const res = await axios.post(`${BASE_URL}/api/chapters/add-bulk`, {
        chapters: bulkPayload,
      });

      // ✅ Handle Partial Success Message
      if (res.data.count === 0) {
        toast.error("All chapters were duplicates!", { id: loadingToast });
      } else {
        toast.success(res.data.message || `${res.data.count} Chapters Added!`, {
          id: loadingToast,
        });
        setBulkJson("");
        setMode("single");
        fetchChapters();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON Syntax! Check commas and brackets.");
      } else {
        const msg = err.response?.data?.error || "Bulk Upload Failed";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };
  // 3. DELETE
  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete Chapter?",
      text: "This will delete all questions inside it!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      setLoading(true);
      const loadingToast = toast.loading("Deleting...");

      try {
        await axios.delete(`${BASE_URL}/api/chapters/${id}`);
        toast.success("Chapter Deleted", { id: loadingToast });
        fetchChapters();
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete chapter");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleErrors = (err) => {
    console.error(err);
    const errorMsg =
      err.response?.data?.error || err.response?.data?.message || "Failed";
    if (errorMsg.includes("duplicate") || errorMsg.includes("E11000")) {
      toast.error("Error: Chapter Number already exists!");
    } else {
      toast.error(errorMsg);
    }
  };

  if (!isExpanded) return null;

  return (
    <div
      className={`section-card expanded border-top-4 border-success ${
        loading ? "opacity-75" : ""
      }`}
      style={{ pointerEvents: loading ? "none" : "auto" }}
    >
      {/* ✅ Local Toaster to ensure visibility */}
      <Toaster position="top-right" />

      <div className="section-title">
        <FaFolderOpen className="text-success me-2" />
        Chapters for{" "}
        <span className="text-success">{selectedSubject?.subjectName}</span>
      </div>

      <div className="row">
        {/* LEFT: LIST */}
        <div className="col-md-7">
          <div
            className="list-group shadow-sm"
            style={{ maxHeight: "550px", overflowY: "auto" }}
          >
            {chapters.length === 0 && (
              <div className="p-4 text-center text-muted">
                No Chapters Found.
              </div>
            )}
            {chapters.map((ch) => (
              <div
                key={ch._id}
                className={`list-group-item d-flex justify-content-between align-items-center py-3 ${
                  editingId === ch._id ? "bg-light border-primary" : ""
                }`}
              >
                {/* ✅ UPDATED LAYOUT: Single Line */}
                <div>
                  <span className="fw-bold me-2 badge bg-primary">
                    Ch {ch.chapterNumber}
                  </span>

                  {/* English Name */}
                  <span className="fw-bold text-dark">
                    {typeof ch.name === "object" ? ch.name.en : ch.name}
                  </span>

                  {/* Urdu Name (Inline with Brackets) */}
                  {ch.name?.ur && (
                    <span className="ms-2 urdu-font text-secondary">
                      ({ch.name.ur})
                    </span>
                  )}
                </div>

                {/* BUTTONS */}
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => handleEditClick(ch)}
                    disabled={loading}
                    title="Edit"
                  >
                    <FaPen />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(ch._id)}
                    disabled={loading}
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
          <div
            className="bg-white p-4 rounded shadow-sm border sticky-top"
            style={{ top: "20px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold m-0 text-secondary">
                {editingId ? "Edit Chapter" : "Add New Chapter"}
              </h6>
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

            {mode === "single" ? (
              <form onSubmit={handleSubmitSingle}>
                {editingId && (
                  <div className="alert alert-warning py-2 d-flex justify-content-between align-items-center small mb-3">
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

                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    Chapter No.
                  </label>
                  <input
                    className="form-control"
                    name="number"
                    placeholder="e.g. 1"
                    value={newChapter.number}
                    onChange={handleSimpleInput}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    Chapter Name
                  </label>
                  <input
                    className="form-control mb-1"
                    placeholder="English Name (e.g. Motion)"
                    value={newChapter.name.en}
                    onChange={(e) =>
                      handleLangInput("name", "en", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                  <input
                    className="form-control urdu-font"
                    placeholder="نام (اردو)"
                    value={newChapter.name.ur}
                    onChange={(e) =>
                      handleLangInput("name", "ur", e.target.value)
                    }
                    dir="rtl"
                    disabled={loading}
                  />
                </div>
                {/* ❌ DESCRIPTION INPUT REMOVED */}

                <button
                  className={`btn w-100 fw-bold d-flex justify-content-center align-items-center ${
                    editingId ? "btn-warning text-white" : "btn-success"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      {" "}
                      <FaSpinner className="icon-spin me-2" />{" "}
                      {editingId ? "Updating..." : "Saving..."}{" "}
                    </>
                  ) : (
                    <>
                      {editingId ? (
                        <FaSave className="me-2" />
                      ) : (
                        <FaPlus className="me-2" />
                      )}
                      {editingId ? "Update Chapter" : "Save Chapter"}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div>
                <h6 className="small fw-bold text-muted">JSON Format:</h6>
                <div
                  className="bg-dark text-white p-2 rounded mb-2 small"
                  style={{ fontFamily: "monospace", fontSize: "11px" }}
                >
                  [<br />
                  &nbsp;&nbsp;{`{`}
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"chapterNumber": 1,
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"nameEn": "Matrices",
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"nameUr": "قالب"
                  <br />
                  &nbsp;&nbsp;{`}`}, ...
                  <br />]
                </div>

                <textarea
                  className="form-control mb-3"
                  rows="8"
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
                      {" "}
                      <FaSpinner className="icon-spin me-2" /> Uploading...{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <FaCode className="me-2" /> Upload Bulk{" "}
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
