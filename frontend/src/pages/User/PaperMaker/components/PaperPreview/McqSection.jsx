import React from "react";
import { FaTrash } from "react-icons/fa";
import RenderText from "../../../../../components/ui/RenderText";
import EditableField from "./EditableField";

const McqSection = ({
  mcqs,
  isManualMode,
  onManualUpdate,
  onManualDelete,
  onSectionDelete,
  customHeadings,
  handleHeadingChange,
}) => {
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  if (!mcqs || mcqs.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-center items-center gap-4 border-b-2 border-main print:border-black uppercase pb-1 mb-4">
        {isManualMode ? (
          <EditableField
            value={customHeadings.objEn || "Objective Part"}
            onChange={(v) => handleHeadingChange("objEn", v)}
            className="font-bold text-xl! print:text-xl! pp-hd-en"
          />
        ) : (
          <span
            className="font-bold text-xl! print:text-xl! pp-hd-en"
            dangerouslySetInnerHTML={{
              __html: customHeadings.objEn || "Objective Part",
            }}
          />
        )}
        <span className="font-light opacity-50 text-xl">|</span>
        {isManualMode ? (
          <EditableField
            isUrdu
            value={customHeadings.objUr || "حصہ معروضی"}
            onChange={(v) => handleHeadingChange("objUr", v)}
            className="font-urdu font-bold text-xl! print:text-xl! pp-hd-ur"
          />
        ) : (
          <span
            className="font-urdu font-bold text-xl! print:text-xl! pp-hd-ur"
            dir="rtl"
            dangerouslySetInnerHTML={{
              __html: customHeadings.objUr || "حصہ معروضی",
            }}
          />
        )}
      </div>

      <div className="flex justify-between items-center border-b border-dashed border-border print:border-black pb-2 mb-3">
        <div className="flex-1 text-left text-xl! font-bold pp-hd-en">
          {isManualMode ? (
            <EditableField
              value={
                customHeadings.q1En ||
                `<strong class="mr-1">Q.1</strong> Choose the correct answer.`
              }
              onChange={(v) => handleHeadingChange("q1En", v)}
            />
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html:
                  customHeadings.q1En ||
                  `<strong class="mr-1">Q.1</strong> Choose the correct answer.`,
              }}
            />
          )}
        </div>
        <div className="font-bold text-[0.7rem] px-2 whitespace-nowrap pp-hd-en">
          {isManualMode ? (
            <EditableField
              value={
                customHeadings.q1Marks ||
                `(${mcqs.length} x 1 = ${mcqs.length})`
              }
              onChange={(v) => handleHeadingChange("q1Marks", v)}
            />
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html:
                  customHeadings.q1Marks ||
                  `(${mcqs.length} x 1 = ${mcqs.length})`,
              }}
            />
          )}
        </div>
        <div
          className="flex-1 text-right font-urdu font-bold text-xl! print:text-xl! pp-hd-ur"
          dir="rtl"
        >
          {isManualMode ? (
            <EditableField
              isUrdu
              value={
                customHeadings.q1Ur ||
                `<strong class="ml-1">سوال نمبر 1:</strong> درست جواب کا انتخاب کریں۔`
              }
              onChange={(v) => handleHeadingChange("q1Ur", v)}
            />
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html:
                  customHeadings.q1Ur ||
                  `<strong class="ml-1">سوال نمبر 1:</strong> درست جواب کا انتخاب کریں۔`,
              }}
            />
          )}
        </div>
        {isManualMode && (
          <button
            className="ml-4 bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-500 hover:text-white print:hidden"
            onClick={() => onSectionDelete("MCQ")}
          >
            <FaTrash /> Delete Q.1
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {mcqs.map((q, i) => (
          <div
            key={getQId(q)}
            className="relative flex flex-col gap-1.5 border-b border-dotted border-border print:border-black pb-3 w-full mcq-item"
          >
            {isManualMode && (
              <button
                className="absolute -left-10 top-0 w-7 h-7 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center cursor-pointer text-xs transition-transform hover:scale-110 hover:bg-red-500 hover:text-white print:hidden z-10"
                onClick={() => onManualDelete(getQId(q))}
              >
                <FaTrash />
              </button>
            )}
            <div className="flex gap-2 w-full items-baseline">
              <span className="font-extrabold min-w-6 pp-text-en">
                {i + 1}.
              </span>
              {/* ✅ FONT CLASS ADDED HERE */}
              <div className="flex-1 text-left pp-text-en">
                {isManualMode ? (
                  <EditableField
                    value={q.statement?.en || ""}
                    onChange={(val) =>
                      onManualUpdate(getQId(q), "statement", "en", val)
                    }
                  />
                ) : (
                  <RenderText text={q.statement?.en} />
                )}
              </div>
              {/* ✅ FONT CLASS ADDED HERE */}
              <div className="flex-1 text-right font-urdu pp-text-ur" dir="rtl">
                <span className="font-sans font-extrabold ml-2 inline-block">
                  {i + 1}.
                </span>
                {isManualMode ? (
                  <EditableField
                    value={q.statement?.ur || ""}
                    isUrdu
                    onChange={(val) =>
                      onManualUpdate(getQId(q), "statement", "ur", val)
                    }
                  />
                ) : (
                  <RenderText text={q.statement?.ur} />
                )}
              </div>
            </div>

            {q.image && q.image.url && (
              <div className="flex justify-center my-2 w-full">
                <img
                  src={q.image.url}
                  alt="Diagram"
                  className="max-w-[80%] max-h-20 object-contain border border-border print:max-w-[60%] print:border-none"
                />
              </div>
            )}

            {q.options && (
              <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-x-4 gap-y-2 mt-1 pl-6 w-full">
                {q.options.map((opt, idx) => {
                  const isSameOption = opt.en?.trim() === opt.ur?.trim();
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1 overflow-hidden"
                    >
                      <span className="font-extrabold opacity-90 pp-text-en">
                        ({String.fromCharCode(65 + idx)})
                      </span>
                      <div className="flex gap-1 items-baseline truncate">
                        <span className="text-left pp-text-en">
                          {isManualMode ? (
                            <EditableField
                              isSmall
                              value={opt.en || ""}
                              onChange={(val) =>
                                onManualUpdate(
                                  getQId(q),
                                  "options",
                                  "en",
                                  val,
                                  idx,
                                )
                              }
                            />
                          ) : (
                            <RenderText text={opt.en} />
                          )}
                        </span>
                        {(!isSameOption || isManualMode) && (
                          <span className="font-urdu dir-rtl pp-text-ur">
                            {isManualMode ? (
                              <EditableField
                                isSmall
                                isUrdu
                                value={opt.ur || ""}
                                onChange={(val) =>
                                  onManualUpdate(
                                    getQId(q),
                                    "options",
                                    "ur",
                                    val,
                                    idx,
                                  )
                                }
                              />
                            ) : (
                              <RenderText text={opt.ur} />
                            )}
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
  );
};

export default McqSection;
