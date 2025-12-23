import React from "react";
import { FaPlusCircle, FaRegFileAlt } from "react-icons/fa";
import RenderText from "../../common/RenderText";
import "./PaperPreview.css";

const PaperPreview = ({ paperData, onOpenMenu }) => {
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

  // Safe Check
  const hasSubjective =
    (shortQuestionsMap && Object.keys(shortQuestionsMap).length > 0) ||
    (longQs && longQs.length > 0);

  // Helper to find Section Config from Pattern
  const getSectionConfig = (type, index = null) => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    const sections = pattern?.sections || [];

    if (type === "LONG") {
      return sections.find((s) => s.questionType === "LONG");
    }
    // For Short (index based)
    // Short sections usually start after MCQ.
    // Assumption: Sections are ordered. We need to match logic from TypeTabs.
    // Better Approach: Find section where questionType is SHORT and match index logic
    const shortSections = sections.filter((s) => s.questionType === "SHORT");
    return shortSections[index];
  };

  // ==========================================================
  // GROUP LONG QUESTIONS
  // ==========================================================
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
          (a.tabId || "").localeCompare(b.tabId || "")
        );
      });
  };

  const groupedLongQs = getGroupedLongQuestions();

  // ==========================================================
  // ✅ LOGIC FIX: USE 'toBeAttempted' FROM SCHEMA
  // ==========================================================
  const getLongInstructions = () => {
    const longSec = getSectionConfig("LONG");

    // ✅ FIX: Use 'toBeAttempted' (Schema Field) instead of 'quantity'
    const attemptLimit = parseInt(longSec?.toBeAttempted || 0);
    const available = groupedLongQs.length; // Total added in paper

    // Logic:
    // If user set attempt limit 0 (meaning all) OR limit >= available -> Attempt All
    if (attemptLimit === 0 || attemptLimit >= available) {
      return {
        en: "Note: Attempt all questions.",
        ur: "نوٹ: تمام سوالات حل کریں۔",
      };
    } else {
      // Choice Available
      const qWord = attemptLimit === 1 ? "question" : "questions";
      return {
        en: `Note: Attempt any ${attemptLimit} ${qWord}.`,
        ur: `نوٹ: کوئی سے ${attemptLimit} سوالات حل کریں۔`,
      };
    }
  };

  const longInstr = getLongInstructions();

  return (
    <div className="pp-container">
      {!hasQuestions ? (
        <div className="pp-empty-state">
          <div className="pp-empty-icon">
            <FaRegFileAlt />
          </div>
          <h3>Paper Empty</h3>
          <p>Add questions from the menu.</p>
          <button className="pp-btn-add" onClick={onOpenMenu}>
            <FaPlusCircle /> Open Menu
          </button>
        </div>
      ) : (
        <div className="pp-sheet">
          {/* ... MCQ SECTION (SAME AS BEFORE) ... */}
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
              </div>

              <div className="pp-list">
                {mcqs.map((q, i) => (
                  <div key={q._id || i} className="pp-item-mcq">
                    <div className="pp-stmt">
                      <span className="pp-num">{i + 1}.</span>
                      <div className="pp-text-en">
                        <RenderText text={q.statement?.en} />
                      </div>
                      {q.statement?.ur && (
                        <div className="pp-text-ur" dir="rtl">
                          <span className="pp-ur-num">{i + 1}.</span>
                          <RenderText text={q.statement.ur} />
                        </div>
                      )}
                    </div>
                    {q.options && (
                      <div className="pp-opt-grid">
                        {q.options.map((opt, idx) => {
                          const label = String.fromCharCode(65 + idx);
                          return (
                            <div key={idx} className="pp-opt">
                              <span className="pp-opt-lbl">({label})</span>
                              <div className="pp-opt-content">
                                <span className="pp-opt-en">
                                  <RenderText text={opt.en} />
                                </span>
                                {opt.ur && (
                                  <span className="pp-opt-ur" dir="rtl">
                                    <RenderText text={opt.ur} />
                                  </span>
                                )}
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

          {/* ... SUBJECTIVE SECTION ... */}
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

                // ✅ FIX: Get Config for this Short Section
                const secConfig = getSectionConfig("SHORT", index);

                // ✅ Use 'toBeAttempted' from Schema
                const attemptLimit = parseInt(
                  secConfig?.toBeAttempted || sectionQs.length
                );
                const marksPerQ = parseInt(secConfig?.marksPerQuestion || 2);

                // Total Marks = (Attempt Limit) * (Marks Per Q)
                // Note: Usually marks are based on attempt limit, not total added
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
                    </div>

                    <div className="pp-list">
                      {sectionQs.map((q, i) => (
                        <div key={q._id || i} className="pp-item">
                          <span className="pp-num">({i + 1})</span>
                          <div className="pp-text-en">
                            <RenderText text={q.statement?.en} />
                          </div>
                          {q.statement?.ur && (
                            <div className="pp-text-ur" dir="rtl">
                              <span className="pp-ur-num">({i + 1})</span>
                              <RenderText text={q.statement.ur} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* ✅ LONG QUESTIONS */}
              {groupedLongQs.length > 0 && (
                <div className="pp-sub-section">
                  <div className="pp-q-header">
                    <div className="pp-hd-en">
                      <strong>Section II (Long Questions)</strong>
                    </div>

                    {/* ✅ Correct Instruction showing 'toBeAttempted' */}
                    <div className="pp-hd-marks">{longInstr.en}</div>

                    <div className="pp-hd-ur" dir="rtl">
                      <strong>{longInstr.ur}</strong> (حصہ دوم)
                    </div>
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
                          <div key={q._id || i} className="pp-item">
                            <span className="pp-num">{label}</span>
                            <div className="pp-text-en">
                              <RenderText text={q.statement?.en} />
                            </div>

                            {q.statement?.ur && (
                              <div className="pp-text-ur" dir="rtl">
                                <span className="pp-ur-num">{urLabel}</span>
                                <RenderText text={q.statement.ur} />
                              </div>
                            )}
                            <div className="pp-marks-right">[{q.marks}]</div>
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
