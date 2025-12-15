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
  FaCloudUploadAlt,
  FaSpinner,
} from "react-icons/fa";

// Imports
import RenderText from "../../../../components/common/RenderText";
import BulkUpload from "../BulkUpload/BulkUpload";

const QuestionManager = ({ chapterId, subjectId, classLevel }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // STATES
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filterTopicId, setFilterTopicId] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("single");
  const [editingId, setEditingId] = useState(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

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
    if (chapterId) fetchTopics();
  }, [chapterId]);

  useEffect(() => {
    if (filterTopicId) {
      fetchQuestions();
      setSelectedQuestionIds([]);
    } else {
      setQuestions([]);
    }
  }, [filterTopicId]);

  // API CALLS
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
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/questions/topic/${filterTopicId}`
      );
      const typePriority = { MCQ: 1, SHORT: 2, LONG: 3 };
      const sortedQuestions = res.data.sort((a, b) => {
        const priorityA = typePriority[a.type] || 4;
        const priorityB = typePriority[b.type] || 4;
        return priorityA - priorityB;
      });
      setQuestions(sortedQuestions);
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // HANDLERS
  const handleStatementChange = (lang, val) => {
    setFormData({
      ...formData,
      statement: { ...formData.statement, [lang]: val },
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
      if (current.includes(topicId)) {
        return {
          ...prev,
          selectedTopicIds: current.filter((id) => id !== topicId),
        };
      } else {
        return { ...prev, selectedTopicIds: [...current, topicId] };
      }
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
      options:
        question.options && question.options.length > 0
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
    if (selectedQuestionIds.length === questions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(questions.map((q) => q._id));
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteSelected = async () => {
    if (selectedQuestionIds.length === 0) return;
    const res = await Swal.fire({
      title: `Delete ${selectedQuestionIds.length} Questions?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      background: "var(--card-bg)",
      color: "var(--text-main)",
    });

    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${BASE_URL}/api/questions/delete-bulk`,
          { ids: selectedQuestionIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Deleted!");
        fetchQuestions();
        setSelectedQuestionIds([]);
      } catch (err) {
        toast.error("Failed to delete.");
      }
    }
  };

  const handleDeleteAllInTopic = async () => {
    if (!filterTopicId) return;
    const res = await Swal.fire({
      title: "Delete ALL Questions?",
      text: "This removes EVERYTHING in this topic!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete All!",
      background: "var(--card-bg)",
      color: "var(--text-main)",
    });

    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${BASE_URL}/api/questions/topic/${filterTopicId}/delete-all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("All Deleted!");
        fetchQuestions();
        setSelectedQuestionIds([]);
      } catch (err) {
        toast.error("Failed.");
      }
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      background: "var(--card-bg)",
      color: "var(--text-main)",
    });
    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/api/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deleted");
        fetchQuestions();
      } catch (err) {
        toast.error("Failed");
      }
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
        toast.success("Updated!");
        setEditingId(null);
        setFormData(initialFormState);
      } else {
        await axios.post(`${BASE_URL}/api/questions/add`, data, { headers });
        toast.success("Saved!");
        setFormData((prev) => ({
          ...prev,
          statement: { en: "", ur: "" },
          options: initialFormState.options,
          boardTags: "",
        }));
      }
      if (filterTopicId) fetchQuestions();
      setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ VALIDATION LOGIC
  const hasTopic = formData.selectedTopicIds.length > 0;
  const hasStatement =
    formData.statement.en.trim() !== "" || formData.statement.ur.trim() !== "";
  const isMcqComplete =
    formData.type === "MCQ"
      ? formData.options.every(
          (opt) => opt.en.trim() !== "" || opt.ur.trim() !== ""
        )
      : true; // If not MCQ, ignore options

  const isFormValid = hasTopic && hasStatement && isMcqComplete;

  return (
    <div className="row g-4">
      <Toaster position="top-right" />

      {/* LEFT: LIST */}
      <div className="col-md-7">
        <div className="filter-box-q sticky-top">
          <label className="fw-bold small text-muted mb-2 d-flex align-items-center">
            <FaFilter className="me-2 text-accent" /> Filter Questions
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
                title="Delete All"
              >
                <FaTrashAlt /> All
              </button>
            )}
          </div>
        </div>

        {selectedQuestionIds.length > 0 && (
          <div className="bulk-action-bar">
            <span className="fw-bold">
              {selectedQuestionIds.length} Selected
            </span>
            <button
              className="btn-danger-soft btn-sm"
              onClick={handleDeleteSelected}
            >
              <FaTrashAlt className="me-1" /> Delete
            </button>
          </div>
        )}

        {questions.length > 0 && (
          <div className="d-flex align-items-center mb-2 px-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="selectAll"
                checked={selectedQuestionIds.length === questions.length}
                onChange={selectAllQuestions}
              />
              <label
                className="form-check-label small fw-bold text-muted cursor-pointer"
                htmlFor="selectAll"
              >
                Select All
              </label>
            </div>
          </div>
        )}

        <div className="q-list-container custom-scrollbar">
          {loading ? (
            <div className="text-center py-5 text-muted">Loading...</div>
          ) : questions.length === 0 ? (
            <div className="empty-state-box">
              {filterTopicId
                ? "No questions found."
                : "Select a topic to view questions."}
            </div>
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

                {q.statement.en && (
                  <p className="q-text en">
                    <RenderText text={q.statement.en} />
                  </p>
                )}
                {q.statement.ur && (
                  <p className="q-text ur">
                    <RenderText text={q.statement.ur} />
                  </p>
                )}

                {q.type === "MCQ" && (
                  <div className="mcq-grid">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`mcq-opt ${opt.isCorrect ? "correct" : ""}`}
                      >
                        <span className="opt-label">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <div className="opt-content">
                          <span className="en">
                            <RenderText text={opt.en} />
                          </span>
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

      {/* RIGHT: FORM */}
      <div className="col-md-5">
        <div className="form-card sticky-top">
          <div className="form-header">
            <h6 className="m-0 fw-bold text-accent">
              {editingId ? "Edit Question" : "Add Question"}
            </h6>
            {editingId && (
              <button className="btn-icon close" onClick={handleCancelEdit}>
                <FaTimes />
              </button>
            )}
          </div>

          {!editingId && (
            <div className="mode-switch">
              <button
                className={mode === "single" ? "active" : ""}
                onClick={() => setMode("single")}
              >
                <FaPen className="me-1" /> Single
              </button>
              <button
                className={mode === "bulk" ? "active" : ""}
                onClick={() => setMode("bulk")}
              >
                <FaCode className="me-1" /> Bulk
              </button>
            </div>
          )}

          <div className="p-3">
            {mode === "single" ? (
              <form onSubmit={handleSingleSubmit}>
                {/* 1. Topics */}
                <div className="mb-3">
                  <label className="form-label">
                    Topics <span className="text-danger">*</span>
                  </label>
                  <div
                    className={`multi-select-box custom-scrollbar ${
                      !hasTopic && "border-danger"
                    }`}
                  >
                    {topics.map((t) => (
                      <div key={t._id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`t-${t._id}`}
                          checked={formData.selectedTopicIds.includes(t._id)}
                          onChange={() => toggleTopicSelection(t._id)}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor={`t-${t._id}`}
                        >
                          {t.topicNumber} -{" "}
                          {typeof t.name === "object" ? t.name.en : t.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {!hasTopic && (
                    <div className="text-danger small mt-1">
                      Select at least one topic
                    </div>
                  )}
                </div>

                {/* 2. Type & Category */}
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
                      <option value="TEXT">Text</option>
                      <option value="EXERCISE">Exercise</option>
                      <option value="CONCEPTUAL">Conceptual</option>
                    </select>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label">Difficulty</label>
                  <div className="btn-group w-100" role="group">
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`btn btn-sm ${
                          formData.difficulty === d
                            ? "btn-primary-gradient"
                            : "btn-outline-secondary text-main"
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

                {/* 3. Statement */}
                <div className="mb-3">
                  <label className="form-label">
                    Statement <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control custom-input mb-2 ${
                      !hasStatement && "is-invalid"
                    }`}
                    rows="2"
                    placeholder="English..."
                    value={formData.statement.en}
                    onChange={(e) =>
                      handleStatementChange("en", e.target.value)
                    }
                  ></textarea>
                  <textarea
                    className="form-control custom-input urdu-font"
                    rows="2"
                    placeholder="اردو..."
                    value={formData.statement.ur}
                    onChange={(e) =>
                      handleStatementChange("ur", e.target.value)
                    }
                    dir="rtl"
                  ></textarea>
                </div>

                {/* 4. MCQ Options (Only if MCQ) */}
                {formData.type === "MCQ" && (
                  <div
                    className={`mb-3 p-2 border rounded bg-light-theme ${
                      !isMcqComplete && "border-danger"
                    }`}
                  >
                    <label className="small fw-bold text-muted mb-2 d-block">
                      Options (All 4 Required)
                    </label>
                    {formData.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`d-flex align-items-center gap-2 mb-2 ${
                          opt.isCorrect ? "border-success" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOpt"
                          checked={opt.isCorrect}
                          onChange={() => setCorrectOption(i)}
                        />
                        <input
                          type="text"
                          className="form-control custom-input form-control-sm"
                          placeholder="Eng"
                          value={opt.en}
                          onChange={(e) =>
                            handleOptionChange(i, "en", e.target.value)
                          }
                        />
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
                    {!isMcqComplete && (
                      <div className="text-danger small">
                        Fill all 4 options (English or Urdu)
                      </div>
                    )}
                  </div>
                )}

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      className="form-control custom-input form-control-sm"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-control custom-input form-control-sm"
                      placeholder="LHR-22"
                      value={formData.boardTags}
                      onChange={(e) =>
                        setFormData({ ...formData, boardTags: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* ✅ DISABLED STATE APPLIED HERE */}
                <button
                  type="submit"
                  className="btn-primary-gradient w-100"
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="icon-spin me-2" /> Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <FaSave className="me-2" /> Update
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-2" /> Save Question
                    </>
                  )}
                </button>
              </form>
            ) : (
              <BulkUpload
                chapterId={chapterId}
                subjectId={subjectId}
                classLevel={classLevel}
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
  );
};

export default QuestionManager;
