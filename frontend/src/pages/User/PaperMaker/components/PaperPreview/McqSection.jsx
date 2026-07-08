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
}) => {
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  if (!mcqs || mcqs.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-center items-center gap-4 border-b-2 border-main print:border-black font-extrabold uppercase text-[0.9rem] pb-1 mb-4">
        <span className="text-[0.9rem] print:text-[0.9rem]">
          Objective Part
        </span>
        <span className="font-light opacity-50 text-xl">|</span>
        <span
          className="font-urdu font-bold text-[1.1rem] print:text-[1.1rem]"
          dir="rtl"
        >
          حصہ معروضی
        </span>
      </div>

      <div className="flex justify-between items-center border-b border-dashed border-border print:border-black pb-2 mb-3">
        <div className="flex-1 text-left text-[0.9rem] font-bold">
          <strong className="mr-1 text-[1rem]">Q.1</strong> Choose the correct
          answer.
        </div>
        <div className="font-bold text-[0.7rem] px-2 whitespace-nowrap">
          ({mcqs.length} x 1 = {mcqs.length})
        </div>
        <div
          className="flex-1 text-right font-urdu font-bold text-[0.9rem] print:text-[1rem]"
          dir="rtl"
        >
          <strong className="ml-1 text-[1rem]">سوال نمبر 1:</strong> درست جواب
          کا انتخاب کریں۔
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
            className="relative flex flex-col gap-1.5 border-b border-dotted border-border print:border-black pb-3 w-full"
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
              {/* ✅ Increased size of Q.No */}
              <span className="font-extrabold min-w-6 text-[0.9rem]">
                {i + 1}.
              </span>
              {/* ✅ Made English Statement Bold */}
              <div className="flex-1 text-left text-[0.9rem] font-bold">
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
              {/* ✅ Applied font-urdu and made Urdu Statement Bold */}
              <div
                className="flex-1 text-right font-urdu font-bold text-[1rem] print:text-[1.1rem]"
                dir="rtl"
              >
                {/* ✅ Increased size of Urdu Q.No */}
                <span className="font-sans font-extrabold ml-2 inline-block text-[0.9rem]">
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
                  // ✅ FIX: Check kar rahe hain ke kahin English aur Urdu option bilkul same toh nahi
                  const isSameOption = opt.en?.trim() === opt.ur?.trim();

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1 overflow-hidden"
                    >
                      {/* ✅ (A)(B)(C)(D) */}
                      <span className="font-extrabold text-[0.85rem] opacity-90">
                        ({String.fromCharCode(65 + idx)})
                      </span>
                      <div className="flex gap-1 items-baseline truncate">
                        {/* ✅ English Option */}
                        <span className="font-bold text-[0.85rem] text-left">
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

                        {/* ✅ Urdu Option: Sirf tab dikhao jab yeh English se DIFFERENT ho, ya Manual Mode on ho */}
                        {(!isSameOption || isManualMode) && (
                          <span className="font-urdu font-bold text-[0.9rem] print:text-[1rem] dir-rtl">
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
