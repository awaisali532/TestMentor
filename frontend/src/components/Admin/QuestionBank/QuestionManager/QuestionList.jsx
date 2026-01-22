import React from "react";
import {
  FaPen,
  FaTrashAlt,
  FaFilter,
  FaCheckSquare,
  FaSquare,
} from "react-icons/fa";
import RenderText from "../../../../components/common/RenderText";

const QuestionList = ({
  questions,
  topics,
  filterTopicId,
  setFilterTopicId,
  filterCategory,
  setFilterCategory,

  // ✅ NEW: Array Props receive kiye
  filterTypes,
  setFilterTypes,

  categories,
  handleDeleteAllInTopic,
  handleEdit,
  handleDelete,
  selectedQuestionIds,
  toggleQuestionSelection,
  subjectName,
  editingId,
  isUrduSubject,
}) => {
  // Helper for Headers
  let lastTopicId = null;

  // ✅ Toggle Function
  const toggleType = (type) => {
    if (filterTypes.includes(type)) {
      setFilterTypes(filterTypes.filter((t) => t !== type)); // Remove
    } else {
      setFilterTypes([...filterTypes, type]); // Add
    }
  };

  return (
    <div className="col-md-7">
      <div className="filter-box-q sticky-top">
        <label className="fw-bold small text-muted mb-2 d-flex align-items-center">
          <FaFilter className="me-2 text-accent" /> Filter Questions (
          {subjectName})
        </label>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          {/* 1. TOPIC DROPDOWN */}
          <select
            className="form-select custom-select"
            value={filterTopicId}
            onChange={(e) => setFilterTopicId(e.target.value)}
            style={{ minWidth: "160px", maxWidth: "200px" }}
          >
            <option value="">-- All Topics --</option>
            {topics && topics.length > 0 ? (
              topics.map((t) => {
                const tName = typeof t.name === "object" ? t.name.en : t.name;
                return (
                  <option key={t._id} value={t._id}>
                    {t.topicNumber} - {tName}
                  </option>
                );
              })
            ) : (
              <option disabled>No Topics Found</option>
            )}
          </select>

          {/* 2. CATEGORY DROPDOWN */}
          <select
            className="form-select custom-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ minWidth: "130px", maxWidth: "160px" }}
          >
            <option value="">-- All Categories --</option>
            {categories &&
              categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
          </select>

          {/* 3. ✅ TYPE CHECKBOXES (Buttons Style) */}
          <div className="d-flex gap-1 ms-1 bg-light p-1 rounded border">
            {["MCQ", "SHORT", "LONG"].map((type) => {
              const isActive = filterTypes.includes(type);
              return (
                <button
                  key={type}
                  className={`btn btn-sm d-flex align-items-center gap-1 ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => toggleType(type)}
                  style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                  title={`Toggle ${type}`}
                >
                  {isActive ? (
                    <FaCheckSquare size={10} />
                  ) : (
                    <FaSquare size={10} />
                  )}
                  {type}
                </button>
              );
            })}
          </div>

          {filterTopicId && questions.length > 0 && (
            <button
              className="btn-danger-soft ms-auto"
              onClick={handleDeleteAllInTopic}
              title="Delete All in Topic"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>
      </div>

      <div className="q-list-container custom-scrollbar">
        {questions.length === 0 ? (
          <div className="empty-state-box">
            No questions found matching your filters.
          </div>
        ) : (
          questions.map((q, index) => {
            // Header Logic
            const topicObj =
              q.topics && q.topics.length > 0 ? q.topics[0] : null;
            const currentTopicId = topicObj
              ? typeof topicObj === "object"
                ? topicObj._id
                : topicObj
              : "unknown";

            let topicDisplayName = "General / Unknown Topic";
            if (
              topicObj &&
              typeof topicObj === "object" &&
              topicObj.topicNumber
            ) {
              const tName =
                typeof topicObj.name === "object"
                  ? topicObj.name.en
                  : topicObj.name;
              topicDisplayName = `${topicObj.topicNumber} - ${tName}`;
            } else {
              const found = topics.find((t) => t._id === currentTopicId);
              if (found) {
                const tName =
                  typeof found.name === "object" ? found.name.en : found.name;
                topicDisplayName = `${found.topicNumber} - ${tName}`;
              }
            }

            let showHeader = false;
            if (
              !filterTopicId &&
              currentTopicId !== lastTopicId &&
              currentTopicId !== "unknown"
            ) {
              showHeader = true;
              lastTopicId = currentTopicId;
            }

            return (
              <React.Fragment key={q._id}>
                {showHeader && (
                  <div className="topic-header-row mt-3 mb-2 px-2">
                    <span
                      className="badge bg-secondary text-light w-100 py-2 text-start px-3 shadow-sm"
                      style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}
                    >
                      📌 {topicDisplayName}
                    </span>
                  </div>
                )}

                <div
                  className={`question-card type-${q.type} ${editingId === q._id ? "active-edit" : ""} ${selectedQuestionIds.includes(q._id) ? "selected" : ""}`}
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
                      <span
                        className={`badge ${q.difficulty === "Easy" ? "bg-success" : q.difficulty === "Medium" ? "bg-warning text-dark" : "bg-danger"}`}
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
                            ),
                        )}
                      </div>
                    </div>
                  ) : ["PAIR_OF_WORDS", "IDIOMS", "WORD_MEANING"].includes(
                      q.questionCategory,
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
                          className={`mcq-opt ${opt.isCorrect ? "correct" : ""}`}
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
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionList;
