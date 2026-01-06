import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "./QuestionManager.css";
import {
  FaPlus,
  FaTrashAlt,
  FaPen,
  FaCode,
  FaFilter,
  FaSave,
  FaTimes,
  FaBold,
  FaUnderline,
  FaImage,
} from "react-icons/fa";

// Imports
import RenderText from "../../../../components/common/RenderText";
import BulkUpload from "../BulkUpload/BulkUpload";
import TMLoader from "../../../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../../../components/common/ConfirmationModal/ConfirmationModal";

// Config
import {
  getCategoriesForSubject,
  shouldShowStatementBox,
} from "../../../../config/SubjectConfig";

// HELPER: Rich Text Editor
const TextEditor = ({
  value,
  onChange,
  placeholder,
  isUrdu = false,
  rows = 2,
}) => {
  const insertTag = (tag) => {
    const inputId = `editor-${placeholder.replace(/\s/g, "")}-${
      isUrdu ? "ur" : "en"
    }`;
    const textarea = document.getElementById(inputId);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    onChange(`${before}<${tag}>${selectedText}</${tag}>${after}`);
  };

  return (
    <div className="mb-2">
      <div className="text-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertTag("b")}
          title="Bold"
        >
          <FaBold size={12} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertTag("u")}
          title="Underline"
        >
          <FaUnderline size={12} />
        </button>
      </div>
      <textarea
        id={`editor-${placeholder.replace(/\s/g, "")}-${isUrdu ? "ur" : "en"}`}
        className={`form-control custom-input ${isUrdu ? "urdu-font" : ""}`}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={isUrdu ? "rtl" : "ltr"}
      ></textarea>
    </div>
  );
};

const QuestionManager = ({ chapterId, subjectId, classLevel }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // STATES
  const [subjectName, setSubjectName] = useState("Default");
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filterTopicId, setFilterTopicId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("single");
  const [editingId, setEditingId] = useState(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
  });

  // NEW: Image Logic
  const [removeImageFlag, setRemoveImageFlag] = useState(false);

  const isUrduSubject = [
    "Urdu",
    "Islamiyat",
    "Pak Study",
    "Tarjama",
    "Arabic",
    "History",
  ].some((s) => subjectName.includes(s));

  // Form Data
  const initialFormState = {
    selectedTopicIds: [],
    type: "MCQ",
    questionCategory: "TEXT",
    difficulty: "Medium",
    marks: 1,
    important: false,
    boardTags: "",
    statement: { en: "", ur: "" },
    questionData: { poetName: { en: "", ur: "" }, itemA: "", itemB: "" },
    options: [
      { en: "", ur: "", isCorrect: true },
      { en: "", ur: "", isCorrect: false },
      { en: "", ur: "", isCorrect: false },
      { en: "", ur: "", isCorrect: false },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // INITIAL LOAD
  useEffect(() => {
    if (chapterId && subjectId) {
      fetchTopics();
      fetchSubjectDetails();
    }
  }, [chapterId, subjectId]);

  useEffect(() => {
    if (filterTopicId) {
      fetchQuestions();
      setSelectedQuestionIds([]);
    } else {
      setQuestions([]);
    }
  }, [filterTopicId]);

  // API CALLS
  const fetchSubjectDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects/${subjectId}`);
      if (res.data.subjectName) {
        setSubjectName(res.data.subjectName);
        const cats = getCategoriesForSubject(res.data.subjectName);
        setFormData((prev) => ({ ...prev, questionCategory: cats[0].value }));
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const fetchQuestions = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/questions/topic/${filterTopicId}`
      );
      const typePriority = { MCQ: 1, SHORT: 2, LONG: 3 };
      const sortedData = res.data.sort((a, b) => {
        const typeDiff =
          (typePriority[a.type] || 99) - (typePriority[b.type] || 99);
        return typeDiff === 0
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : typeDiff;
      });
      setQuestions(sortedData);
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS ---
  const handleStatementChange = (lang, val) =>
    setFormData({
      ...formData,
      statement: { ...formData.statement, [lang]: val },
    });

  const handleQDataChange = (field, val, lang = null) => {
    setFormData((prev) => {
      const newData = { ...prev.questionData };
      if (lang) newData[field] = { ...newData[field], [lang]: val };
      else newData[field] = val;
      return { ...prev, questionData: newData };
    });
  };

  const handleOptionChange = (idx, lang, val) => {
    const newOpts = [...formData.options];
    newOpts[idx][lang] = val;
    setFormData({ ...formData, options: newOpts });
  };

  const setCorrectOption = (idx) => {
    const newOpts = formData.options.map((o, i) => ({
      ...o,
      isCorrect: i === idx,
    }));
    setFormData({ ...formData, options: newOpts });
  };

  const toggleTopicSelection = (topicId) => {
    setFormData((prev) => {
      const current = prev.selectedTopicIds;
      return current.includes(topicId)
        ? { ...prev, selectedTopicIds: current.filter((id) => id !== topicId) }
        : { ...prev, selectedTopicIds: [...current, topicId] };
    });
  };

  // ✅ Image Logic
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setRemoveImageFlag(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    setRemoveImageFlag(true); // ✅ Set flag to remove on backend
  };

  // ✅ Edit Mode
  const handleEdit = (question) => {
    setEditingId(question._id);
    setMode("single");
    setRemoveImageFlag(false);

    setFormData({
      selectedTopicIds: question.topics || [],
      type: question.type,
      questionCategory: question.questionCategory,
      difficulty: question.difficulty,
      marks: question.marks,
      important: question.important || false,
      statement: {
        en: question.statement?.en || "",
        ur: question.statement?.ur || "",
      },
      questionData: question.questionData || initialFormState.questionData,
      options:
        question.options.length > 0
          ? question.options
          : initialFormState.options,
      boardTags: Array.isArray(question.boardTags)
        ? question.boardTags.join(", ")
        : "",
    });

    if (question.image && question.image.url) {
      setPreviewImage(question.image.url);
    } else {
      setPreviewImage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setImageFile(null);
    setPreviewImage(null);
    setRemoveImageFlag(false);
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id) =>
    setDeleteModal({
      isOpen: true,
      type: "SINGLE",
      id,
      title: "Delete?",
      message: "Sure?",
    });
  const handleDeleteSelected = () => {
    if (selectedQuestionIds.length > 0)
      setDeleteModal({
        isOpen: true,
        type: "BULK",
        title: "Delete Selected?",
        message: "Sure?",
      });
  };
  const handleDeleteAllInTopic = () => {
    if (filterTopicId)
      setDeleteModal({
        isOpen: true,
        type: "ALL_TOPIC",
        title: "Delete ALL?",
        message: "Sure?",
      });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal({ ...deleteModal, isOpen: false });
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      if (deleteModal.type === "SINGLE") {
        await axios.delete(`${BASE_URL}/api/questions/${deleteModal.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deleted");
      } else if (deleteModal.type === "BULK") {
        await axios.post(
          `${BASE_URL}/api/questions/delete-bulk`,
          { ids: selectedQuestionIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Deleted");
        setSelectedQuestionIds([]);
      } else if (deleteModal.type === "ALL_TOPIC") {
        await axios.delete(
          `${BASE_URL}/api/questions/topic/${filterTopicId}/delete-all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Cleared");
        setSelectedQuestionIds([]);
      }
      fetchQuestions();
    } catch (err) {
      Swal.fire("Error", "Failed to delete", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    if (formData.type === "MCQ") {
      const filled = formData.options.filter((opt) =>
        isUrduSubject ? opt.ur?.trim() : opt.en?.trim() || opt.ur?.trim()
      );
      if (filled.length < 4) return toast.error("MCQ must have 4 options!");
    }

    setIsSubmitting(true);
    const data = new FormData();

    data.append("topics", JSON.stringify(formData.selectedTopicIds));
    data.append("chapterId", chapterId);
    data.append("subjectId", subjectId);
    data.append("classLevel", classLevel);
    data.append("type", formData.type);
    data.append("questionCategory", formData.questionCategory);
    data.append("difficulty", formData.difficulty);
    data.append("marks", formData.marks);
    data.append("important", formData.important);
    data.append("statement", JSON.stringify(formData.statement));
    data.append("questionData", JSON.stringify(formData.questionData));
    if (formData.type === "MCQ")
      data.append("options", JSON.stringify(formData.options));

    // ✅ Handle Image Logic
    if (imageFile) data.append("image", imageFile);
    data.append("removeImage", removeImageFlag); // 👈 Backend needs this string "true"/"false"

    const tags = formData.boardTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    data.append("boardTags", JSON.stringify(tags));

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` }; // ✅ No 'Content-Type' manually

      if (editingId) {
        await axios.put(`${BASE_URL}/api/questions/${editingId}`, data, {
          headers,
        });
        Swal.fire({
          icon: "success",
          title: "Updated!",
          timer: 1500,
          showConfirmButton: false,
        });
        handleCancelEdit(); // Reset everything
      } else {
        await axios.post(`${BASE_URL}/api/questions/add`, data, { headers });
        Swal.fire({
          icon: "success",
          title: "Saved!",
          timer: 1500,
          showConfirmButton: false,
        });

        // Soft Reset (Keep settings)
        setFormData((prev) => ({
          ...prev,
          statement: { en: "", ur: "" },
          questionData: initialFormState.questionData,
          options: initialFormState.options,
          boardTags: "",
          important: false,
        }));
        setPreviewImage(null);
        setImageFile(null);
        setRemoveImageFlag(false);
      }
      if (filterTopicId) fetchQuestions();
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire("Error", err.response?.data?.error || "Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = getCategoriesForSubject(subjectName);
  const showMainStatement = shouldShowStatementBox(formData.questionCategory);
  const hasTopic = formData.selectedTopicIds.length > 0;

  let hasContent = false;
  if (showMainStatement)
    hasContent = isUrduSubject
      ? !!formData.statement.ur.trim()
      : !!formData.statement.en.trim() || !!formData.statement.ur.trim();
  else hasContent = !!formData.questionData.itemA.trim();

  const isFormValid = hasTopic && hasContent;

  return (
    <>
      {isSubmitting && <TMLoader />}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />

      <div className="row g-4">
        <Toaster position="top-right" />

        {/* --- LEFT: LIST --- */}
        <div className="col-md-7">
          <div className="filter-box-q sticky-top">
            <label className="fw-bold small text-muted mb-2 d-flex align-items-center">
              <FaFilter className="me-2 text-accent" /> Filter ({subjectName})
            </label>
            <div className="d-flex gap-2">
              <select
                className="form-select custom-select"
                value={filterTopicId}
                onChange={(e) => setFilterTopicId(e.target.value)}
              >
                <option value="">-- Select Topic --</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.topicNumber} -{" "}
                    {typeof t.name === "object" ? t.name.en : t.name}
                  </option>
                ))}
              </select>
              {filterTopicId && questions.length > 0 && (
                <button
                  className="btn-danger-soft"
                  onClick={handleDeleteAllInTopic}
                >
                  <FaTrashAlt /> All
                </button>
              )}
            </div>
          </div>

          <div className="q-list-container custom-scrollbar">
            {questions.length === 0 ? (
              <div className="empty-state-box">Select a topic.</div>
            ) : (
              questions.map((q, index) => (
                <div
                  key={q._id}
                  className={`question-card type-${q.type} ${
                    editingId === q._id ? "active-edit" : ""
                  } ${selectedQuestionIds.includes(q._id) ? "selected" : ""}`}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedQuestionIds.includes(q._id)}
                        onChange={() => toggleQuestionSelection(q._id)}
                      />
                      <span className="fw-bold fs-6 text-accent">
                        #{index + 1}
                      </span>
                      <span className="badge-type">{q.type}</span>
                      <span className="badge-cat">{q.questionCategory}</span>
                      <span className="badge-marks">{q.marks} Marks</span>

                      {/* ✅ DIFFICULTY BADGE ADDED */}
                      <span
                        className={`badge ${
                          q.difficulty === "Easy"
                            ? "bg-success"
                            : q.difficulty === "Medium"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        {q.difficulty}
                      </span>

                      {q.important && (
                        <span className="badge bg-warning text-dark small">
                          IMP
                        </span>
                      )}
                      {q.boardTags?.length > 0 && (
                        <div className="d-flex gap-1">
                          {q.boardTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="badge bg-info text-dark small"
                              style={{ fontSize: "0.6rem" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(q)}
                      >
                        <FaPen />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(q._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>

                  {/* Render Content Logic (Same as before) */}
                  {q.questionCategory === "POETRY" ? (
                    <div className="poetry-wrapper">
                      {q.questionData?.poetName?.ur && (
                        <div className="text-center text-muted small urdu-font mb-2">
                          ({q.questionData.poetName.ur})
                        </div>
                      )}
                      <div className="poetry-grid">
                        {q.statement.ur.split("\n").map(
                          (line, i) =>
                            line.trim() && (
                              <div key={i} className="poetry-line">
                                <RenderText text={line} />
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  ) : ["PAIR_OF_WORDS", "IDIOMS", "WORD_MEANING"].includes(
                      q.questionCategory
                    ) ? (
                    <div className="d-flex gap-2 align-items-center bg-light-theme p-2 rounded">
                      <strong className="text-main">
                        {q.questionData?.itemA}
                      </strong>
                      <span className="text-muted mx-2">↔</span>
                      <strong className="text-accent">
                        {q.questionData?.itemB}
                      </strong>
                    </div>
                  ) : (
                    <>
                      {!isUrduSubject && q.statement.en && (
                        <p className="q-text en">
                          <RenderText text={q.statement.en} />
                        </p>
                      )}
                      {q.statement.ur && (
                        <p className="q-text ur">
                          <RenderText text={q.statement.ur} />
                        </p>
                      )}
                    </>
                  )}

                  {q.image && q.image.url && (
                    <div className="mt-2 text-center">
                      <img
                        src={q.image.url}
                        alt="Q"
                        style={{
                          maxHeight: "100px",
                          maxWidth: "100%",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                  )}

                  {q.type === "MCQ" && (
                    <div className="mcq-grid">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`mcq-opt ${
                            opt.isCorrect ? "correct" : ""
                          }`}
                        >
                          <span className="opt-label">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div className="opt-content">
                            {!isUrduSubject && (
                              <span className="en">
                                <RenderText text={opt.en} />
                              </span>
                            )}
                            {opt.ur && (
                              <span className="ur">
                                <RenderText text={opt.ur} />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT: FORM --- */}
        <div className="col-md-5">
          <div className="form-card sticky-top">
            <div className="form-header d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold text-accent">
                {editingId ? "Edit Question" : "Add Question"}
              </h6>
            </div>

            {!editingId && (
              <div className="mode-switch">
                <button
                  className={mode === "single" ? "active" : ""}
                  onClick={() => setMode("single")}
                >
                  <FaPen /> Single
                </button>
                <button
                  className={mode === "bulk" ? "active" : ""}
                  onClick={() => setMode("bulk")}
                >
                  <FaCode /> Bulk
                </button>
              </div>
            )}

            <div className="p-3">
              {mode === "single" ? (
                <form onSubmit={handleSingleSubmit}>
                  {/* Topic Selection */}
                  <div className="mb-3">
                    <label className="form-label">
                      Topics <span className="text-danger">*</span>
                    </label>
                    <div className="multi-select-box custom-scrollbar">
                      {topics.map((t) => (
                        <div key={t._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.selectedTopicIds.includes(t._id)}
                            onChange={() => toggleTopicSelection(t._id)}
                          />
                          <label className="form-check-label small">
                            {t.topicNumber} -{" "}
                            {typeof t.name === "object" ? t.name.en : t.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Type & Category */}
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select custom-select"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      >
                        <option value="MCQ">MCQ</option>
                        <option value="SHORT">Short</option>
                        <option value="LONG">Long</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select custom-select"
                        value={formData.questionCategory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            questionCategory: e.target.value,
                          })
                        }
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Inputs (Poetry/Pairs/Text) */}
                  {formData.questionCategory === "POETRY" ? (
                    <div className="row g-2 mb-2">
                      {!isUrduSubject && (
                        <div className="col-6">
                          <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="Poet Name"
                            value={formData.questionData.poetName.en}
                            onChange={(e) =>
                              handleQDataChange(
                                "poetName",
                                e.target.value,
                                "en"
                              )
                            }
                          />
                        </div>
                      )}
                      <div className={isUrduSubject ? "col-12" : "col-6"}>
                        <input
                          type="text"
                          className="form-control custom-input urdu-font"
                          placeholder="شاعر کا نام"
                          dir="rtl"
                          value={formData.questionData.poetName.ur}
                          onChange={(e) =>
                            handleQDataChange("poetName", e.target.value, "ur")
                          }
                        />
                      </div>
                    </div>
                  ) : ["PAIR_OF_WORDS", "IDIOMS", "WORD_MEANING"].includes(
                      formData.questionCategory
                    ) ? (
                    <div className="mb-3 p-3 bg-light-theme border rounded d-flex gap-2">
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="Item A"
                        value={formData.questionData.itemA}
                        onChange={(e) =>
                          handleQDataChange("itemA", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="Item B"
                        value={formData.questionData.itemB}
                        onChange={(e) =>
                          handleQDataChange("itemB", e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">
                        Statement <span className="text-danger">*</span>
                      </label>
                      {!isUrduSubject && (
                        <TextEditor
                          value={formData.statement.en}
                          onChange={(val) => handleStatementChange("en", val)}
                          placeholder="English Statement..."
                        />
                      )}
                      <TextEditor
                        value={formData.statement.ur}
                        onChange={(val) => handleStatementChange("ur", val)}
                        placeholder="اردو..."
                        isUrdu={true}
                        rows={formData.questionCategory === "POETRY" ? 4 : 2}
                      />
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="mb-3">
                    <label className="form-label">Image (Optional)</label>
                    <div className="d-flex gap-2 align-items-center">
                      <label
                        className="btn btn-outline-secondary btn-sm"
                        style={{ cursor: "pointer" }}
                      >
                        <FaImage className="me-2" /> Upload{" "}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      {previewImage && (
                        <div
                          className="position-relative"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <img
                            src={previewImage}
                            alt="Prev"
                            className="img-thumbnail w-100 h-100 object-fit-cover"
                          />
                          {/* ✅ Cross Button Logic Implemented */}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                            style={{
                              width: "20px",
                              height: "20px",
                              fontSize: "10px",
                            }}
                            onClick={clearImage}
                          >
                            X
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {formData.type === "MCQ" && (
                    <div className="mb-3 p-2 border rounded bg-light-theme">
                      {formData.options.map((opt, i) => (
                        <div
                          key={i}
                          className="d-flex align-items-center gap-2 mb-2"
                        >
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={opt.isCorrect}
                            onChange={() => setCorrectOption(i)}
                          />
                          {!isUrduSubject && (
                            <input
                              type="text"
                              className="form-control custom-input form-control-sm"
                              placeholder="Eng"
                              value={opt.en}
                              onChange={(e) =>
                                handleOptionChange(i, "en", e.target.value)
                              }
                            />
                          )}
                          <input
                            type="text"
                            className="form-control custom-input form-control-sm urdu-font"
                            placeholder="اردو"
                            value={opt.ur}
                            onChange={(e) =>
                              handleOptionChange(i, "ur", e.target.value)
                            }
                            dir="rtl"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extra Fields */}
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label">
                        Marks <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control custom-input text-center fw-bold"
                        value={formData.marks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            marks: parseInt(e.target.value) || 0,
                          })
                        }
                        min="1"
                      />
                    </div>
                    <div className="col-8">
                      <label className="form-label">Board Tags</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="LHR-22, GRW-21"
                        value={formData.boardTags}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            boardTags: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Difficulty & Important */}
                  <div className="mb-3">
                    <label className="form-label">Difficulty</label>
                    <div className="btn-group w-100">
                      {["Easy", "Medium", "Hard"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`btn btn-sm ${
                            formData.difficulty === d
                              ? "btn-primary-gradient"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() =>
                            setFormData({ ...formData, difficulty: d })
                          }
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="impCheck"
                      checked={formData.important}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          important: e.target.checked,
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="impCheck">
                      Mark as Important?
                    </label>
                  </div>

                  {/* Submit & Cancel (Cancel Logic integrated in Header) */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary-gradient w-100"
                      disabled={isSubmitting || !isFormValid}
                    >
                      {editingId ? "Update" : "Save"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-50"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <BulkUpload
                  chapterId={chapterId}
                  subjectId={subjectId}
                  classLevel={classLevel}
                  subjectName={subjectName}
                  onSuccess={() => {
                    fetchQuestions();
                    setMode("single");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionManager;
