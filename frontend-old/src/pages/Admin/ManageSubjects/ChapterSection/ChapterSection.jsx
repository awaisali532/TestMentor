import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaFolderOpen,
  FaTrashAlt,
  FaPen,
  FaSave,
  FaCode,
  FaTimes,
  FaPlus,
} from "react-icons/fa";

// ✅ Import Custom Components
import TMLoader from "../../../../components/common/TMLoader/TMLoader"; // Path check kr lena
import ConfirmationModal from "../../../../components/common/ConfirmationModal/ConfirmationModal"; // Path check kr lena

// ✅ Import CSS
import "./ChapterSection.css";

const ChapterSection = ({ isExpanded, selectedSubject }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // STATES
  const [chapters, setChapters] = useState([]);
  const [mode, setMode] = useState("single");
  const [bulkJson, setBulkJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ States for Custom Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  const [newChapter, setNewChapter] = useState({
    number: "",
    name: { en: "", ur: "" },
  });

  // ✅ CHECK SUBJECT TYPE
  const isUrduSubject =
    selectedSubject &&
    ["Urdu", "Islamiyat", "Pak Study", "Tarjama", "Arabic", "History"].some(
      (s) => selectedSubject.subjectName.includes(s),
    );

  useEffect(() => {
    if (isExpanded && selectedSubject) fetchChapters();
  }, [isExpanded, selectedSubject]);

  const fetchChapters = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chapters/subject/${selectedSubject._id}`,
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
    document
      .querySelector(".chapter-form-card")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewChapter({ number: "", name: { en: "", ur: "" } });
  };

  // ==========================================
  // 1. HANDLE SUBMIT (SINGLE)
  // ==========================================
  const handleSubmitSingle = async (e) => {
    e.preventDefault();

    if (!newChapter.number) return toast.error("Chapter Number is required!");

    if (isUrduSubject) {
      if (!newChapter.name.ur.trim())
        return toast.error("Urdu Name is required for this subject!");
    } else {
      if (!newChapter.name.en.trim())
        return toast.error("English Name is required!");
    }

    setLoading(true); // 👈 TMLoader show hoga
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
      setLoading(false); // 👈 TMLoader hide hoga
    }
  };

  // ==========================================
  // 2. HANDLE BULK UPLOAD
  // ==========================================
  const handleBulkUpload = async () => {
    if (!bulkJson) return toast.error("Paste JSON first.");

    let bulkPayload;
    try {
      const parsedData = JSON.parse(bulkJson);
      bulkPayload = parsedData.map((item) => ({
        subject: selectedSubject._id,
        chapterNumber: item.chapterNumber,
        name: {
          en: item.nameEn || item.name,
          ur: item.nameUr || "",
        },
      }));
    } catch (jsonError) {
      return toast.error("Invalid JSON Format! Please check your syntax.");
    }

    setLoading(true); // 👈 TMLoader show hoga

    try {
      const res = await axios.post(`${BASE_URL}/api/chapters/add-bulk`, {
        chapters: bulkPayload,
      });

      if (res.data.status === "warning") {
        toast(res.data.message, {
          icon: "⚠️",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      } else {
        toast.success(res.data.message || "Bulk Upload Complete");
      }

      setBulkJson("");
      setMode("single");
      fetchChapters();
    } catch (err) {
      const serverMessage =
        err.response?.data?.error || err.response?.data?.message;

      if (serverMessage) {
        toast.error(serverMessage);
      } else {
        toast.error("Upload Failed (Check Console)");
        console.error(err);
      }
    } finally {
      setLoading(false); // 👈 TMLoader hide hoga
    }
  };

  // ==========================================
  // 3. HANDLE DELETE (CUSTOM MODAL)
  // ==========================================

  // Step 1: Open Modal
  const requestDelete = (id) => {
    setChapterToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Step 2: Execute Delete (Called by Modal onConfirm)
  const confirmDelete = async () => {
    if (!chapterToDelete) return;

    setLoading(true); // 👈 TMLoader show hoga
    try {
      await axios.delete(`${BASE_URL}/api/chapters/${chapterToDelete}`);
      toast.success("Deleted");
      fetchChapters();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setLoading(false); // 👈 TMLoader hide hoga
      setChapterToDelete(null);
    }
  };

  // ✅ DYNAMIC VALIDATION LOGIC
  const isSingleValid =
    String(newChapter.number).trim() !== "" &&
    (isUrduSubject
      ? newChapter.name.ur.trim() !== ""
      : newChapter.name.en.trim() !== "");
  const isBulkValid = bulkJson.trim() !== "";

  if (!isExpanded) return null;

  return (
    <div className={`section-card expanded`}>
      <Toaster />

      {/* ✅ GLOBAL LOADER (Shows when loading is true) */}
      {loading && <TMLoader message="Processing Request..." />}

      {/* ✅ CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Chapter?"
        message="Are you sure you want to delete this chapter? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />

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
                    {isUrduSubject ? (
                      <>
                        <span className="chapter-name-en urdu-font fs-5">
                          {ch.name?.ur || "---"}
                        </span>
                        {typeof ch.name === "object" && ch.name.en && (
                          <span className="chapter-name-ur ms-2">
                            ({ch.name.en})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="chapter-name-en">
                          {typeof ch.name === "object" ? ch.name.en : ch.name}
                        </span>
                        {ch.name?.ur && (
                          <span className="chapter-name-ur">
                            ({ch.name.ur})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="action-icon-btn edit"
                    onClick={() => handleEditClick(ch)}
                    title="Edit"
                    disabled={loading} // Prevent clicks during loading
                  >
                    <FaPen />
                  </button>
                  <button
                    className="action-icon-btn delete"
                    onClick={() => requestDelete(ch._id)} // 👈 Opens Modal
                    title="Delete"
                    disabled={loading} // Prevent clicks during loading
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
                {editingId ? (
                  <>
                    Edit <span className="highlight-text">Chapter</span>
                  </>
                ) : (
                  <>
                    Add <span className="highlight-text">New Chapter</span>
                  </>
                )}
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
                  <label className="form-label">
                    Chapter No. <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control custom-input"
                    name="number"
                    placeholder="e.g. 1"
                    value={newChapter.number}
                    onChange={handleSimpleInput}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Chapter Name (English){" "}
                    {!isUrduSubject && <span className="text-danger">*</span>}
                  </label>
                  <input
                    className="form-control custom-input mb-3"
                    placeholder={
                      isUrduSubject ? "English Name (Optional)" : "English Name"
                    }
                    value={newChapter.name.en}
                    onChange={(e) =>
                      handleLangInput("name", "en", e.target.value)
                    }
                  />

                  <label className="form-label">
                    Chapter Name (Urdu){" "}
                    {isUrduSubject && <span className="text-danger">*</span>}
                  </label>
                  <input
                    className="form-control custom-input urdu-font"
                    placeholder={
                      isUrduSubject ? "نام (اردو)" : "نام (Optional)"
                    }
                    dir="rtl"
                    value={newChapter.name.ur}
                    onChange={(e) =>
                      handleLangInput("name", "ur", e.target.value)
                    }
                  />
                </div>

                <button
                  className="btn-primary-gradient w-100 d-flex justify-content-center align-items-center"
                  disabled={loading || !isSingleValid}
                >
                  {/* Text Change based on State */}
                  {editingId ? (
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
                  disabled={loading || !isBulkValid}
                >
                  <FaCode className="me-2" /> Upload Bulk
                </button>

                {!isBulkValid && bulkJson.trim() === "" && (
                  <div className="text-danger small mt-2">
                    * Code block cannot be empty.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterSection;
