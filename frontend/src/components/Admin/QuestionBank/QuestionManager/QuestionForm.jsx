import React from "react";
import {
  FaPen,
  FaCode,
  FaImage,
  FaTimes,
  FaBold,
  FaUnderline,
} from "react-icons/fa";
import BulkUpload from "../BulkUpload/BulkUpload";
import {
  getCategoriesForSubject,
  shouldShowStatementBox,
} from "../../../../config/SubjectConfig";

// ✅ Helper Component: TextEditor (Moved here)
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

const QuestionForm = ({
  mode,
  setMode,
  editingId,
  formData,
  setFormData,
  imageFile,
  previewImage,
  handleImageChange,
  clearImage,
  handleSingleSubmit, // Form Submit Handler
  handleCancelEdit,
  chapterId,
  subjectId,
  classLevel,
  subjectName,
  topics,
  fetchQuestions,
  isSubmitting,
  isUrduSubject,
}) => {
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

  // Handlers Wrapper
  const handleQDataChange = (field, val, lang = null) => {
    setFormData((prev) => {
      const newData = { ...prev.questionData };
      if (lang) newData[field] = { ...newData[field], [lang]: val };
      else newData[field] = val;
      return { ...prev, questionData: newData };
    });
  };

  const toggleTopicSelection = (topicId) => {
    setFormData((prev) => {
      const current = prev.selectedTopicIds;
      return current.includes(topicId)
        ? { ...prev, selectedTopicIds: current.filter((id) => id !== topicId) }
        : { ...prev, selectedTopicIds: [...current, topicId] };
    });
  };

  const handleStatementChange = (lang, val) =>
    setFormData({
      ...formData,
      statement: { ...formData.statement, [lang]: val },
    });
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

  return (
    <div className="form-card sticky-top">
      <div className="form-header d-flex justify-content-between align-items-center">
        <h6 className="m-0 fw-bold text-accent">
          {editingId ? "Edit Question" : "Add Question"}
        </h6>
        {editingId && (
          <button
            onClick={handleCancelEdit}
            className="btn btn-sm btn-danger d-flex align-items-center gap-1"
            style={{ padding: "2px 8px", fontSize: "0.8rem" }}
          >
            <FaTimes /> Cancel
          </button>
        )}
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
                        handleQDataChange("poetName", e.target.value, "en")
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
                  onChange={(e) => handleQDataChange("itemA", e.target.value)}
                />
                <input
                  type="text"
                  className="form-control custom-input"
                  placeholder="Item B"
                  value={formData.questionData.itemB}
                  onChange={(e) => handleQDataChange("itemB", e.target.value)}
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
                  <div key={i} className="d-flex align-items-center gap-2 mb-2">
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
                    setFormData({ ...formData, boardTags: e.target.value })
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
                    onClick={() => setFormData({ ...formData, difficulty: d })}
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
                  setFormData({ ...formData, important: e.target.checked })
                }
              />
              <label className="form-check-label" htmlFor="impCheck">
                Mark as Important?
              </label>
            </div>

            {/* Submit & Cancel */}
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
  );
};

export default QuestionForm;
