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

// ✅ HELPER COMPONENT: Rich Text Editor (For Underline/Bold)
const TextEditor = ({
  value,
  onChange,
  placeholder,
  isUrdu = false,
  rows = 2,
}) => {
  // Function to wrap selected text in tags <b> or <u>
  const insertTag = (tag) => {
    const inputId = `editor-${placeholder.replace(/\s/g, "")}-${
      isUrdu ? "ur" : "en"
    }`;
    const textarea = document.getElementById(inputId);

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return; // Kuch select nahi kiya to wapis jao

    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    // Naya text banao tags k sath
    const newText = `${before}<${tag}>${selectedText}</${tag}>${after}`;
    onChange(newText);
  };

  return (
    <div className="mb-2">
      {/* Tiny Toolbar */}
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

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
  });

  // CHECK IF SUBJECT IS URDU BASED
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
    questionData: {
      poetName: { en: "", ur: "" },
      itemA: "",
      itemB: "",
    },
    options: [
      { en: "", ur: "", isCorrect: true },
      { en: "", ur: "", isCorrect: false },
      { en: "", ur: "", isCorrect: false },
      { en: "", ur: "", isCorrect: false },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);

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
      setQuestions(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS ---
  const handleStatementChange = (lang, val) => {
    setFormData({
      ...formData,
      statement: { ...formData.statement, [lang]: val },
    });
  };

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
      if (current.includes(topicId))
        return {
          ...prev,
          selectedTopicIds: current.filter((id) => id !== topicId),
        };
      else return { ...prev, selectedTopicIds: [...current, topicId] };
    });
  };

  const handleEdit = (question) => {
    setEditingId(question._id);
    setMode("single");
    setFormData({
      selectedTopicIds: question.topics || [],
      type: question.type,
      questionCategory: question.questionCategory,
      difficulty: question.difficulty,
      marks: question.marks,
      important: question.important,
      statement: {
        en: question.statement.en || "",
        ur: question.statement.ur || "",
      },
      questionData: question.questionData || initialFormState.questionData,
      options:
        question.options.length > 0
          ? question.options
          : initialFormState.options,
      boardTags: question.boardTags ? question.boardTags.join(", ") : "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setImageFile(null);
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const selectAllQuestions = () => {
    if (selectedQuestionIds.length === questions.length)
      setSelectedQuestionIds([]);
    else setSelectedQuestionIds(questions.map((q) => q._id));
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id) =>
    setDeleteModal({
      isOpen: true,
      type: "SINGLE",
      id: id,
      title: "Delete?",
      message: "Sure?",
    });
  const handleDeleteSelected = () => {
    if (selectedQuestionIds.length > 0)
      setDeleteModal({
        isOpen: true,
        type: "BULK",
        id: null,
        title: "Delete Selected?",
        message: "Sure?",
      });
  };
  const handleDeleteAllInTopic = () => {
    if (filterTopicId)
      setDeleteModal({
        isOpen: true,
        type: "ALL_TOPIC",
        id: null,
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
    if (imageFile) data.append("image", imageFile);
    const tags = formData.boardTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    data.append("boardTags", JSON.stringify(tags));

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };
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
        setEditingId(null);
        setFormData(initialFormState);
      } else {
        await axios.post(`${BASE_URL}/api/questions/add`, data, { headers });
        Swal.fire({
          icon: "success",
          title: "Saved!",
          timer: 1500,
          showConfirmButton: false,
        });
        setFormData((prev) => ({
          ...prev,
          statement: { en: "", ur: "" },
          questionData: initialFormState.questionData,
          options: initialFormState.options,
          boardTags: "",
        }));
      }
      if (filterTopicId) fetchQuestions();
      setImageFile(null);
    } catch (err) {
      Swal.fire("Error", "Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Config & Validation
  const categories = getCategoriesForSubject(subjectName);
  const showMainStatement = shouldShowStatementBox(formData.questionCategory);

  const hasTopic = formData.selectedTopicIds.length > 0;
  let hasContent = false;
  if (showMainStatement) {
    if (isUrduSubject) hasContent = formData.statement.ur.trim() !== "";
    else
      hasContent =
        formData.statement.en.trim() !== "" ||
        formData.statement.ur.trim() !== "";
  } else {
    hasContent = formData.questionData.itemA.trim() !== "";
  }

  const isMcqComplete =
    formData.type === "MCQ"
      ? formData.options.every((opt) =>
          isUrduSubject
            ? opt.ur.trim() !== ""
            : opt.en.trim() !== "" || opt.ur.trim() !== ""
        )
      : true;

  const isFormValid = hasTopic && hasContent && isMcqComplete;

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

        {/* --- LEFT SIDE: QUESTION LIST --- */}
        <div className="col-md-7">
          <div className="filter-box-q sticky-top">
            <label className="fw-bold small text-muted mb-2 d-flex align-items-center">
              <FaFilter className="me-2 text-accent" /> Filter Questions (
              {subjectName})
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

                  {/* ✅ SPECIAL RENDER FOR POETRY (50/50 Grid) */}
                  {q.questionCategory === "POETRY" ? (
                    <div className="poetry-wrapper">
                      {q.questionData?.poetName?.ur && (
                        <div className="text-center text-muted small urdu-font mb-2">
                          ({q.questionData.poetName.ur})
                        </div>
                      )}
                      <div className="poetry-grid">
                        {/* Lines ko \n se split karo */}
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

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="col-md-5">
          <div className="form-card sticky-top">
            <div className="form-header">
              <h6 className="m-0 fw-bold text-accent">
                {editingId ? "Edit" : "Add"} Question
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
                  {/* TOPIC & TYPE Selectors (Keep as is) */}
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

                  {/* DYNAMIC FIELDS */}
                  {/* 1. POETRY */}
                  {formData.questionCategory === "POETRY" && (
                    <div className="row g-2 mb-2">
                      {!isUrduSubject && (
                        <div className="col-6">
                          <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="Poet Name (Eng)"
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
                  )}

                  {/* 2. PAIR OF WORDS */}
                  {["PAIR_OF_WORDS", "IDIOMS", "WORD_MEANING"].includes(
                    formData.questionCategory
                  ) ? (
                    <div className="mb-3 p-3 bg-light-theme border rounded">
                      <div className="d-flex gap-2 mb-2">
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
                    </div>
                  ) : (
                    /* 3. STANDARD STATEMENT with TextEditor */
                    <div className="mb-3">
                      <label className="form-label">
                        {formData.questionCategory === "POETRY"
                          ? "Stanza (Lines)"
                          : "Statement"}{" "}
                        <span className="text-danger">*</span>
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

                  {/* 4. MCQ OPTIONS */}
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

                  {/* Marks Input */}
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
                  {/* DIFFICULTY & IMAGE (Keep as is) */}
                  <div className="mb-2">
                    <label className="form-label">Difficulty</label>
                    <div className="btn-group w-100">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          formData.difficulty === "Easy"
                            ? "btn-primary-gradient"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, difficulty: "Easy" })
                        }
                      >
                        Easy
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          formData.difficulty === "Medium"
                            ? "btn-primary-gradient"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, difficulty: "Medium" })
                        }
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          formData.difficulty === "Hard"
                            ? "btn-primary-gradient"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, difficulty: "Hard" })
                        }
                      >
                        Hard
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-gradient w-100"
                    disabled={isSubmitting || !isFormValid}
                  >
                    Save
                  </button>
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
