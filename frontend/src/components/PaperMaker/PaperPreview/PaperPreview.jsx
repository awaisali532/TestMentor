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
          {/* =========================================
              PART 1: OBJECTIVE (MCQs)
             ========================================= */}
          {mcqs.length > 0 && (
            <div className="pp-section">
              {/* ✅ CENTERED HEADER */}
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
                    {/* Statement */}
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

                    {/* ✅ Options (Grid places A Left, B Right automatically) */}
                    {q.options && (
                      <div className="pp-opt-grid">
                        {q.options.map((opt, idx) => {
                          const label = String.fromCharCode(65 + idx); // A, B, C, D
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

          {/* =========================================
              PART 2: SUBJECTIVE
             ========================================= */}
          {hasSubjective && (
            <div className="pp-section">
              {/* ✅ CENTERED HEADER */}
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
                const totalMarks = sectionQs.length * 2;

                return (
                  <div key={secKey} className="pp-sub-section">
                    <div className="pp-q-header">
                      <div className="pp-hd-en">
                        <strong>Q.{qNumber}</strong> Write short answers to any{" "}
                        {sectionQs.length} questions.
                      </div>
                      <div className="pp-hd-marks">
                        ({sectionQs.length} x 2 = {totalMarks})
                      </div>
                      <div className="pp-hd-ur" dir="rtl">
                        <strong>سوال نمبر {qNumber}:</strong> کوئی سے{" "}
                        {sectionQs.length} سوالات کے مختصر جوابات لکھیں۔
                      </div>
                    </div>

                    <div className="pp-list">
                      {sectionQs.map((q, i) => (
                        <div key={q._id || i} className="pp-item">
                          <span className="pp-num">({i + 1})</span>
                          <div className="pp-text-en">
                            <RenderText text={q.statement?.en} />
                          </div>

                          {/* Urdu Numbering */}
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

              {/* LONG QUESTIONS */}
              {longQs.length > 0 && (
                <div className="pp-sub-section">
                  <div className="pp-q-header">
                    <div className="pp-hd-en">
                      <strong>Section II (Long Questions)</strong>
                    </div>
                    <div className="pp-hd-marks">
                      Note: Attempt any questions.
                    </div>
                    <div className="pp-hd-ur" dir="rtl">
                      <strong>حصہ دوم (تفصیلی سوالات)</strong>
                    </div>
                  </div>

                  <div className="pp-list">
                    {longQs.map((q, i) => {
                      const startNum =
                        2 + Object.keys(shortQuestionsMap).length;
                      const qNum = startNum + i;
                      return (
                        <div key={q._id || i} className="pp-item">
                          <span className="pp-num">Q.{qNum}</span>
                          <div className="pp-text-en">
                            <RenderText text={q.statement?.en} />
                          </div>

                          {q.statement?.ur && (
                            <div className="pp-text-ur" dir="rtl">
                              <span className="pp-ur-num">Q.{qNum}</span>
                              <RenderText text={q.statement.ur} />
                            </div>
                          )}
                          <div className="pp-marks-right">[{q.marks}]</div>
                        </div>
                      );
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
