import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // ✅ Ensure Toaster is imported
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
  FaCheckSquare,
  FaSquare,
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

  const [loading, setLoading] = useState(false); // For fetching data
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ For Save/Update buttons
  const [mode, setMode] = useState("single");
  const [editingId, setEditingId] = useState(null);

  // ✅ New State for Bulk Selection
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
      setSelectedQuestionIds([]); // Reset selection on topic change
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
      console.error(err);
      toast.error("Failed to load topics");
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/questions/topic/${filterTopicId}`
      );

      // ✅ SORTING LOGIC HERE
      const typePriority = { MCQ: 1, SHORT: 2, LONG: 3 };

      const sortedQuestions = res.data.sort((a, b) => {
        const priorityA = typePriority[a.type] || 4; // Default to 4 if type is unknown
        const priorityB = typePriority[b.type] || 4;
        return priorityA - priorityB;
      });

      setQuestions(sortedQuestions); // Set the sorted data
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

  // ✅ HANDLER: Checkbox Logic
  const toggleQuestionSelection = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const selectAllQuestions = () => {
    if (selectedQuestionIds.length === questions.length) {
      setSelectedQuestionIds([]); // Deselect All
    } else {
      setSelectedQuestionIds(questions.map((q) => q._id)); // Select All
    }
  };

  // ✅ HANDLER: Bulk Delete Selected
  const handleDeleteSelected = async () => {
    if (selectedQuestionIds.length === 0) return;

    const res = await Swal.fire({
      title: `Delete ${selectedQuestionIds.length} Questions?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
    });

    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${BASE_URL}/api/questions/delete-bulk`,
          { ids: selectedQuestionIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Selected questions deleted!");
        fetchQuestions();
        setSelectedQuestionIds([]);
      } catch (err) {
        toast.error("Failed to delete selected questions.");
      }
    }
  };

  // ✅ HANDLER: Delete All in Topic
  const handleDeleteAllInTopic = async () => {
    if (!filterTopicId) return;

    const res = await Swal.fire({
      title: "Delete ALL Questions?",
      text: "This will remove EVERY question in this topic. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete Everything!",
    });

    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${BASE_URL}/api/questions/topic/${filterTopicId}/delete-all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("All questions deleted successfully!");
        fetchQuestions();
        setSelectedQuestionIds([]);
      } catch (err) {
        toast.error("Failed to delete all questions.");
      }
    }
  };

  // SINGLE SUBMIT (Updated Loading Logic)
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selectedTopicIds.length === 0)
      return toast.error("Please select at least one Topic!");
    if (!formData.statement.en && !formData.statement.ur)
      return toast.error("Statement is empty!");

    setIsSubmitting(true); // ✅ Start Loading

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
        toast.success("Question Updated!");
        setEditingId(null);
        setFormData(initialFormState);
      } else {
        await axios.post(`${BASE_URL}/api/questions/add`, data, { headers });
        toast.success("Question Saved!");

        // Reset form but keep topics selected
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
      console.error(err);
      toast.error(err.response?.data?.error || "Operation Failed");
    } finally {
      setIsSubmitting(false); // ✅ Stop Loading
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
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

  return (
    <div className="row g-4">
      <Toaster position="top-right" /> {/* ✅ Ensuring Toaster is here */}
      {/* LEFT: LIST (Filter by Topic) */}
      <div className="col-md-7">
        {/* Filter Box */}
        <div className="filter-box-q bg-white p-3 rounded shadow-sm border mb-3">
          <label className="fw-bold small text-secondary mb-1">
            <FaFilter className="me-1" /> Filter Questions by Topic
          </label>
          <div className="d-flex gap-2">
            <select
              className="form-select border-primary"
              value={filterTopicId}
              onChange={(e) => setFilterTopicId(e.target.value)}
            >
              <option value="">-- Select Topic to View Questions --</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.topicNumber} -{" "}
                  {typeof t.name === "object" ? t.name.en : t.name}
                </option>
              ))}
            </select>

            {/* 🔴 Delete All Button (Only if topic selected) */}
            {filterTopicId && questions.length > 0 && (
              <button
                className="btn btn-danger text-nowrap"
                title="Delete All in Topic"
                onClick={handleDeleteAllInTopic}
              >
                <FaTrashAlt /> All
              </button>
            )}
          </div>
        </div>

        {/* ✅ Bulk Actions Bar */}
        {selectedQuestionIds.length > 0 && (
          <div className="bg-danger bg-opacity-10 text-danger p-2 mb-3 rounded d-flex justify-content-between align-items-center border border-danger">
            <span className="fw-bold ms-2">
              {selectedQuestionIds.length} Questions Selected
            </span>
            <button
              className="btn btn-sm btn-danger fw-bold"
              onClick={handleDeleteSelected}
            >
              <FaTrashAlt className="me-1" /> Delete Selected
            </button>
          </div>
        )}

        {/* List Header (Select All) */}
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
                className="form-check-label small fw-bold text-secondary cursor-pointer"
                htmlFor="selectAll"
              >
                Select All
              </label>
            </div>
          </div>
        )}

        <div className="q-list-container">
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : questions.length === 0 ? (
            <div className="text-center text-muted py-5 border rounded bg-light border-dashed">
              {filterTopicId
                ? "No questions found in this topic."
                : "Select a topic above to view questions."}
            </div>
          ) : (
            questions.map((q, index) => (
              <div
                key={q._id}
                className={`question-card type-${q.type} ${
                  editingId === q._id ? "border-primary bg-light" : ""
                } ${
                  selectedQuestionIds.includes(q._id)
                    ? "border-danger bg-danger bg-opacity-10"
                    : ""
                }`}
              >
                <div className="d-flex justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    {/* ✅ Individual Checkbox */}
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      style={{ width: "1.2em", height: "1.2em" }}
                      checked={selectedQuestionIds.includes(q._id)}
                      onChange={() => toggleQuestionSelection(q._id)}
                    />

                    <span className="fw-bold fs-5 me-2 text-secondary">
                      #{index + 1}
                    </span>
                    <span className="badge bg-dark me-1">{q.type}</span>
                    <span className="badge bg-info text-dark me-1">
                      {q.questionCategory}
                    </span>
                    <span className="badge bg-secondary">{q.marks} Marks</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(q)}
                    >
                      <FaPen />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(q._id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>

                {q.statement.en && (
                  <p className="q-statement-en">
                    <RenderText text={q.statement.en} />
                  </p>
                )}
                {q.statement.ur && (
                  <p className="q-statement-ur">
                    <RenderText text={q.statement.ur} />
                  </p>
                )}

                {q.type === "MCQ" && (
                  <div className="mcq-options-grid">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`mcq-option ${
                          opt.isCorrect ? "correct" : ""
                        }`}
                      >
                        <span className="fw-bold me-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <RenderText text={opt.en} />
                        {opt.ur && (
                          <span className="opt-ur">
                            (<RenderText text={opt.ur} />)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* RIGHT: FORM (Add/Edit) */}
      <div className="col-md-5">
        <div className="q-form-sticky bg-white p-3 rounded shadow-sm border">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 className={`m-0 fw-bold ${editingId ? "text-primary" : ""}`}>
              {editingId ? "Edit Question" : "Add New Question"}
            </h5>
            {editingId && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleCancelEdit}
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>

          {!editingId && (
            <div className="d-flex justify-content-center mb-3 bg-light p-1 rounded">
              <button
                className={`btn btn-sm flex-fill ${
                  mode === "single" ? "btn-white shadow fw-bold" : ""
                }`}
                onClick={() => setMode("single")}
              >
                <FaPen /> Single
              </button>
              <button
                className={`btn btn-sm flex-fill ${
                  mode === "bulk" ? "btn-white shadow fw-bold" : ""
                }`}
                onClick={() => setMode("bulk")}
              >
                <FaCode /> Bulk JSON
              </button>
            </div>
          )}

          {mode === "single" ? (
            <form onSubmit={handleSingleSubmit}>
              {/* ✅ MULTI-SELECT TOPICS */}
              <div className="mb-3">
                <label className="form-label small fw-bold d-block">
                  Select Topics (Multiple)
                </label>
                <div
                  className="topic-multiselect-box border rounded p-2"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {topics.map((t) => (
                    <div key={t._id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`topic-${t._id}`}
                        checked={formData.selectedTopicIds.includes(t._id)}
                        onChange={() => toggleTopicSelection(t._id)}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor={`topic-${t._id}`}
                      >
                        {t.topicNumber} -{" "}
                        {typeof t.name === "object" ? t.name.en : t.name}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.selectedTopicIds.length === 0 && (
                  <div className="text-danger small mt-1">* Required</div>
                )}
              </div>

              {/* Type & Category */}
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Type</label>
                  <select
                    className="form-select form-select-sm"
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
                  <label className="form-label small fw-bold">Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.questionCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        questionCategory: e.target.value,
                      })
                    }
                  >
                    <option value="TEXT">Text / Theory</option>
                    <option value="EXERCISE">Exercise</option>
                    <option value="EXAMPLE">Example</option>
                    <option value="NUMERICAL">Numerical</option>
                    <option value="REVIEW">Review Ex</option>
                    <option value="CONCEPTUAL">Conceptual</option>
                  </select>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-2">
                <label className="form-label small fw-bold d-block">
                  Difficulty
                </label>
                <div className="btn-group w-100 btn-group-sm">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <React.Fragment key={d}>
                      <input
                        type="radio"
                        className="btn-check"
                        name="diff"
                        id={d}
                        checked={formData.difficulty === d}
                        onChange={() =>
                          setFormData({ ...formData, difficulty: d })
                        }
                      />
                      <label
                        className={`btn btn-outline-${
                          d === "Easy"
                            ? "success"
                            : d === "Medium"
                            ? "secondary"
                            : "danger"
                        }`}
                        htmlFor={d}
                      >
                        {d}
                      </label>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Statement */}
              <div className="mb-2">
                <label className="form-label small fw-bold">Statement</label>
                <textarea
                  className="form-control form-control-sm mb-1"
                  rows="2"
                  placeholder="English..."
                  value={formData.statement.en}
                  onChange={(e) => handleStatementChange("en", e.target.value)}
                ></textarea>
                <textarea
                  className="form-control form-control-sm urdu-font"
                  rows="2"
                  placeholder="اردو..."
                  value={formData.statement.ur}
                  onChange={(e) => handleStatementChange("ur", e.target.value)}
                ></textarea>
              </div>

              {/* MCQ Options */}
              {formData.type === "MCQ" && (
                <div className="mb-2 bg-light p-2 rounded border">
                  <label className="small fw-bold text-muted">
                    Options (Select Correct)
                  </label>
                  {formData.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`option-box d-flex align-items-center gap-2 ${
                        opt.isCorrect ? "correct" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="opt"
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(i)}
                        style={{ cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Eng"
                        value={opt.en}
                        onChange={(e) =>
                          handleOptionChange(i, "en", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm urdu-font m-0"
                        placeholder="اردو"
                        value={opt.ur}
                        onChange={(e) =>
                          handleOptionChange(i, "ur", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Image & Tags */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="small fw-bold">Image</label>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
                <div className="col-6">
                  <label className="small fw-bold">Tags</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="LHR-22"
                    value={formData.boardTags}
                    onChange={(e) =>
                      setFormData({ ...formData, boardTags: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Submit Button (Updated Logic) */}
              <button
                type="submit"
                className={`btn w-100 fw-bold ${
                  editingId ? "btn-warning text-white" : "btn-primary"
                }`}
                disabled={
                  isSubmitting || formData.selectedTopicIds.length === 0
                }
              >
                {isSubmitting ? (
                  <span>Loading...</span> // You can add a Spinner Icon here
                ) : editingId ? (
                  <>
                    <FaSave className="me-2" /> Update Question
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
              topicId={formData.selectedTopicIds[0]}
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
  );
};

export default QuestionManager;
