import React from "react";
import { FaPlusCircle, FaRegFileAlt, FaTrash } from "react-icons/fa";
import RenderText from "../../common/RenderText";
import "./PaperPreview.css";

const PaperPreview = ({
  paperData,
  onOpenMenu,
  isPrintMode = false,
  isManualMode,
  onManualUpdate,
  onManualDelete,
  onSectionDelete,
}) => {
  const questions = paperData?.questions || [];

  // --- FILTERING ---
  const mcqs = questions.filter((q) => q.type === "MCQ");

  const shortQuestionsMap = {};
  questions
    .filter((q) => q.type === "SHORT")
    .forEach((q) => {
      const key = q.tabId || "General";
      if (!shortQuestionsMap[key]) shortQuestionsMap[key] = [];
      shortQuestionsMap[key].push(q);
    });

  const longQs = questions.filter((q) => q.type === "LONG");
  const hasQuestions = questions.length > 0;

  const hasSubjective =
    (shortQuestionsMap && Object.keys(shortQuestionsMap).length > 0) ||
    (longQs && longQs.length > 0);

  const getSectionConfig = (type, index = null) => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    const sections = pattern?.sections || [];
    if (type === "LONG") {
      return sections.find((s) => s.questionType === "LONG");
    }
    const shortSections = sections.filter((s) => s.questionType === "SHORT");
    return shortSections[index];
  };

  const getGroupedLongQuestions = () => {
    const grouped = {};
    longQs.forEach((q) => {
      const parts = q.tabId ? q.tabId.split("_") : [];
      if (parts.length >= 4) {
        const groupKey = `${parts[0]}_${parts[1]}_${parts[2]}`;
        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push(q);
      } else {
        grouped[q._id] = [q];
      }
    });
    return Object.keys(grouped)
      .sort()
      .map((key) => {
        return grouped[key].sort((a, b) =>
          (a.tabId || "").localeCompare(b.tabId || ""),
        );
      });
  };

  const groupedLongQs = getGroupedLongQuestions();

  // ✅ UPDATED INSTRUCTION LOGIC (Compulsory + Attempt Count)
  const getLongInstructions = () => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    const sections = pattern?.sections || [];

    // 1. Get Total to Attempt
    const attemptLimit = parseInt(pattern?.longQAttemptCount || 0);
    const available = groupedLongQs.length;

    // 2. Find if any Long Section is Compulsory
    // We check the sections array to see which Question No is marked isCompulsory
    const longSections = sections.filter((s) => s.questionType === "LONG");
    const compulsorySec = longSections.find((s) => s.isCompulsory === true);
    const compulsoryQNo = compulsorySec ? compulsorySec.questionNo : null; // e.g. "Q.5"

    let enText = "";
    let urText = "";

    // CASE A: Attempt ALL (If limit is 0 or >= available)
    if (attemptLimit === 0 || attemptLimit >= available) {
      enText = "Note: Attempt all questions.";
      urText = "نوٹ: تمام سوالات حل کریں۔";
    }
    // CASE B: Attempt Specific Count
    else {
      const qWord = attemptLimit === 1 ? "question" : "questions";
      enText = `Note: Attempt any ${attemptLimit} ${qWord}`;
      urText = `نوٹ: کوئی سے ${attemptLimit} سوالات حل کریں`;

      // Append Compulsory Note if exists
      if (compulsoryQNo) {
        enText += ` (${compulsoryQNo} is compulsory).`;
        urText += ` (${compulsoryQNo} لازمی ہے)۔`;
      } else {
        enText += ".";
        urText += "۔";
      }
    }

    return { en: enText, ur: urText };
  };

  const longInstr = getLongInstructions();
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  return (
    <div className={`pp-container ${isManualMode ? "manual-active" : ""}`}>
      {!hasQuestions ? (
        <div className="pp-empty-state">
          <div className="pp-empty-icon">
            <FaRegFileAlt />
          </div>
          <h3>Paper Empty</h3>
          <p>Add questions from the menu.</p>
          {!isPrintMode && (
            <button className="pp-btn-add" onClick={onOpenMenu}>
              <FaPlusCircle /> Open Menu
            </button>
          )}
        </div>
      ) : (
        <div className="pp-sheet">
          {/* ================= MCQ SECTION ================= */}
          {mcqs.length > 0 && (
            <div className="pp-section">
              <div className="pp-part-header">
                <span className="pp-ph-en">Objective Part</span>
                <span className="pp-header-sep">|</span>
                <span className="pp-ph-ur" dir="rtl">
                  حصہ معروضی
                </span>
              </div>

              <div className="pp-q-header">
                <div className="pp-hd-en">
                  <strong>Q.1</strong> Choose the correct answer.
                </div>
                <div className="pp-hd-marks">
                  ({mcqs.length} x 1 = {mcqs.length})
                </div>
                <div className="pp-hd-ur" dir="rtl">
                  <strong>سوال نمبر 1:</strong> درست جواب کا انتخاب کریں۔
                </div>
                {isManualMode && (
                  <button
                    className="pp-sec-del-btn"
                    onClick={() => onSectionDelete("MCQ")}
                  >
                    <FaTrash /> Delete Q.1
                  </button>
                )}
              </div>

              <div className="pp-list">
                {mcqs.map((q, i) => (
                  <div key={getQId(q)} className="pp-item-mcq">
                    {isManualMode && (
                      <button
                        className="pp-item-del-btn"
                        onClick={() => onManualDelete(getQId(q))}
                      >
                        <FaTrash />
                      </button>
                    )}

                    {/* Statement Row */}
                    <div className="pp-stmt">
                      <span className="pp-num">{i + 1}.</span>
                      <div className="pp-text-en">
                        {isManualMode ? (
                          <textarea
                            className="pp-edit-input"
                            value={q.statement?.en || ""}
                            onChange={(e) =>
                              onManualUpdate(
                                getQId(q),
                                "statement",
                                "en",
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          <RenderText text={q.statement?.en} />
                        )}
                      </div>
                      <div className="pp-text-ur" dir="rtl">
                        <span className="pp-ur-num">{i + 1}.</span>
                        {isManualMode ? (
                          <textarea
                            className="pp-edit-input"
                            dir="rtl"
                            value={q.statement?.ur || ""}
                            onChange={(e) =>
                              onManualUpdate(
                                getQId(q),
                                "statement",
                                "ur",
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          <RenderText text={q.statement?.ur} />
                        )}
                      </div>
                    </div>

                    {/* MCQ IMAGE */}
                    {q.image && q.image.url && (
                      <div className="pp-image-container">
                        <img
                          src={q.image.url}
                          alt="Diagram"
                          className="pp-image"
                        />
                      </div>
                    )}

                    {/* Options Grid */}
                    {q.options && (
                      <div className="pp-opt-grid">
                        {q.options.map((opt, idx) => {
                          const label = String.fromCharCode(65 + idx);
                          return (
                            <div key={idx} className="pp-opt">
                              <span className="pp-opt-lbl">({label})</span>
                              <div className="pp-opt-content">
                                <span className="pp-opt-en">
                                  {isManualMode ? (
                                    <input
                                      className="pp-edit-input-sm"
                                      value={opt.en || ""}
                                      onChange={(e) =>
                                        onManualUpdate(
                                          getQId(q),
                                          "options",
                                          "en",
                                          e.target.value,
                                          idx,
                                        )
                                      }
                                    />
                                  ) : (
                                    <RenderText text={opt.en} />
                                  )}
                                </span>
                                <span className="pp-opt-ur" dir="rtl">
                                  {isManualMode ? (
                                    <input
                                      className="pp-edit-input-sm"
                                      dir="rtl"
                                      value={opt.ur || ""}
                                      onChange={(e) =>
                                        onManualUpdate(
                                          getQId(q),
                                          "options",
                                          "ur",
                                          e.target.value,
                                          idx,
                                        )
                                      }
                                    />
                                  ) : (
                                    <RenderText text={opt.ur} />
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SUBJECTIVE SECTION ================= */}
          {hasSubjective && (
            <div className="pp-section">
              <div className="pp-part-header">
                <span className="pp-ph-en">Subjective Part</span>
                <span className="pp-header-sep">|</span>
                <span className="pp-ph-ur" dir="rtl">
                  حصہ انشائیہ
                </span>
              </div>

              {/* SHORT QUESTIONS */}
              {Object.keys(shortQuestionsMap).map((secKey, index) => {
                const sectionQs = shortQuestionsMap[secKey];
                const qNumber = index + 2;
                const secConfig = getSectionConfig("SHORT", index);
                const attemptLimit = parseInt(
                  secConfig?.toBeAttempted || sectionQs.length,
                );
                const marksPerQ = parseInt(secConfig?.marksPerQuestion || 2);
                const totalMarks = attemptLimit * marksPerQ;

                return (
                  <div key={secKey} className="pp-sub-section">
                    <div className="pp-q-header">
                      <div className="pp-hd-en">
                        <strong>Q.{qNumber}</strong> Write short answers to any{" "}
                        {attemptLimit} questions.
                      </div>
                      <div className="pp-hd-marks">
                        ({attemptLimit} x {marksPerQ} = {totalMarks})
                      </div>
                      <div className="pp-hd-ur" dir="rtl">
                        <strong>سوال نمبر {qNumber}:</strong> کوئی سے{" "}
                        {attemptLimit} سوالات کے مختصر جوابات لکھیں۔
                      </div>
                      {isManualMode && (
                        <button
                          className="pp-sec-del-btn"
                          onClick={() => onSectionDelete("SHORT", secKey)}
                        >
                          <FaTrash /> Delete Q.{qNumber}
                        </button>
                      )}
                    </div>

                    <div className="pp-list">
                      {sectionQs.map((q, i) => (
                        <div key={getQId(q)} className="pp-vertical-block">
                          {isManualMode && (
                            <button
                              className="pp-item-del-btn"
                              onClick={() => onManualDelete(getQId(q))}
                            >
                              <FaTrash />
                            </button>
                          )}

                          {/* 1. Text Row */}
                          <div className="pp-item">
                            <span className="pp-num">({i + 1})</span>
                            <div className="pp-text-en">
                              {isManualMode ? (
                                <textarea
                                  className="pp-edit-input"
                                  value={q.statement?.en || ""}
                                  onChange={(e) =>
                                    onManualUpdate(
                                      getQId(q),
                                      "statement",
                                      "en",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <RenderText text={q.statement?.en} />
                              )}
                            </div>
                            <div className="pp-text-ur" dir="rtl">
                              <span className="pp-ur-num">({i + 1})</span>
                              {isManualMode ? (
                                <textarea
                                  className="pp-edit-input"
                                  dir="rtl"
                                  value={q.statement?.ur || ""}
                                  onChange={(e) =>
                                    onManualUpdate(
                                      getQId(q),
                                      "statement",
                                      "ur",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <RenderText text={q.statement.ur} />
                              )}
                            </div>
                          </div>

                          {/* 2. IMAGE ROW */}
                          {q.image && q.image.url && (
                            <div className="pp-image-container">
                              <img
                                src={q.image.url}
                                alt="Diagram"
                                className="pp-image"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* LONG QUESTIONS */}
              {groupedLongQs.length > 0 && (
                <div className="pp-sub-section">
                  <div className="pp-q-header">
                    <div className="pp-hd-en">
                      <strong>Section II (Long Questions)</strong>
                    </div>
                    {/* ✅ DYNAMIC INSTRUCTIONS */}
                    <div className="pp-hd-marks">{longInstr.en}</div>
                    <div className="pp-hd-ur" dir="rtl">
                      <strong>{longInstr.ur}</strong> (حصہ دوم)
                    </div>
                    {isManualMode && (
                      <button
                        className="pp-sec-del-btn"
                        onClick={() => onSectionDelete("LONG")}
                      >
                        <FaTrash /> Delete Section II
                      </button>
                    )}
                  </div>

                  <div className="pp-list">
                    {groupedLongQs.map((group, groupIndex) => {
                      const startNum =
                        2 + Object.keys(shortQuestionsMap).length;
                      const qNum = startNum + groupIndex;

                      return group.map((q, i) => {
                        let label = `Q.${qNum}`;
                        let urLabel = `Q.${qNum}`;

                        if (q.tabId?.endsWith("_a")) {
                          label += " (a)";
                          urLabel += " (الف)";
                        } else if (q.tabId?.endsWith("_b")) {
                          label += " (b)";
                          urLabel += " (ب)";
                        }

                        return (
                          <div key={getQId(q)} className="pp-vertical-block">
                            {isManualMode && (
                              <button
                                className="pp-item-del-btn"
                                onClick={() => onManualDelete(getQId(q))}
                              >
                                <FaTrash />
                              </button>
                            )}

                            {/* Text Row */}
                            <div className="pp-item">
                              <span className="pp-num">{label}</span>
                              <div className="pp-text-en">
                                {isManualMode ? (
                                  <textarea
                                    className="pp-edit-input"
                                    value={q.statement?.en || ""}
                                    onChange={(e) =>
                                      onManualUpdate(
                                        getQId(q),
                                        "statement",
                                        "en",
                                        e.target.value,
                                      )
                                    }
                                  />
                                ) : (
                                  <RenderText text={q.statement?.en} />
                                )}
                              </div>

                              <div className="pp-text-ur" dir="rtl">
                                <span className="pp-ur-num">{urLabel}</span>
                                {isManualMode ? (
                                  <textarea
                                    className="pp-edit-input"
                                    dir="rtl"
                                    value={q.statement?.ur || ""}
                                    onChange={(e) =>
                                      onManualUpdate(
                                        getQId(q),
                                        "statement",
                                        "ur",
                                        e.target.value,
                                      )
                                    }
                                  />
                                ) : (
                                  <RenderText text={q.statement.ur} />
                                )}
                              </div>
                              <div className="pp-marks-right">[{q.marks}]</div>
                            </div>

                            {/* IMAGE ROW */}
                            {q.image && q.image.url && (
                              <div className="pp-image-container">
                                <img
                                  src={q.image.url}
                                  alt="Diagram"
                                  className="pp-image"
                                />
                              </div>
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperPreview;
