import React from "react";
import { FaTrash } from "react-icons/fa";
import RenderText from "../../../../../components/ui/RenderText";
import EditableField from "./EditableField";

const ShortSection = ({
  shortQuestionsMap,
  getSectionConfig,
  isManualMode,
  onManualUpdate,
  onManualDelete,
  onSectionDelete,
  customHeadings,
  handleHeadingChange,
}) => {
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  if (!shortQuestionsMap || Object.keys(shortQuestionsMap).length === 0)
    return null;

  return (
    <>
      {Object.keys(shortQuestionsMap).map((secKey, index) => {
        const sectionQs = shortQuestionsMap[secKey];
        const qNumber = index + 2;
        const secConfig = getSectionConfig("SHORT", index);
        const attemptLimit = parseInt(
          secConfig?.toBeAttempted || sectionQs.length,
        );
        const marksPerQ = parseInt(secConfig?.marksPerQuestion || 2);

        return (
          <div key={secKey} className="mb-5">
            <div className="flex justify-between items-center border-b border-dashed border-border print:border-black pb-2 mb-3">
              <div className="flex-1 text-left text-xl! font-bold">
                {isManualMode ? (
                  <EditableField
                    value={
                      customHeadings[`shortEn_${secKey}`] ||
                      `<strong class="mr-1">Q.${qNumber}</strong> Write short answers to any ${attemptLimit} questions.`
                    }
                    onChange={(v) =>
                      handleHeadingChange(`shortEn_${secKey}`, v)
                    }
                  />
                ) : (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        customHeadings[`shortEn_${secKey}`] ||
                        `<strong class="mr-1">Q.${qNumber}</strong> Write short answers to any ${attemptLimit} questions.`,
                    }}
                  />
                )}
              </div>
              <div className="font-bold text-[0.7rem] px-2 whitespace-nowrap">
                {isManualMode ? (
                  <EditableField
                    value={
                      customHeadings[`shortMarks_${secKey}`] ||
                      `(${attemptLimit} x ${marksPerQ} = ${attemptLimit * marksPerQ})`
                    }
                    onChange={(v) =>
                      handleHeadingChange(`shortMarks_${secKey}`, v)
                    }
                  />
                ) : (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        customHeadings[`shortMarks_${secKey}`] ||
                        `(${attemptLimit} x ${marksPerQ} = ${attemptLimit * marksPerQ})`,
                    }}
                  />
                )}
              </div>
              <div
                className="flex-1 text-right font-urdu font-bold text-xl! print:text-xl!"
                dir="rtl"
              >
                {isManualMode ? (
                  <EditableField
                    isUrdu
                    value={
                      customHeadings[`shortUr_${secKey}`] ||
                      `<strong class="ml-1">سوال نمبر ${qNumber}:</strong> کوئی سے ${attemptLimit} سوالات کے مختصر جوابات لکھیں۔`
                    }
                    onChange={(v) =>
                      handleHeadingChange(`shortUr_${secKey}`, v)
                    }
                  />
                ) : (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        customHeadings[`shortUr_${secKey}`] ||
                        `<strong class="ml-1">سوال نمبر ${qNumber}:</strong> کوئی سے ${attemptLimit} سوالات کے مختصر جوابات لکھیں۔`,
                    }}
                  />
                )}
              </div>
              {isManualMode && (
                <button
                  className="ml-4 bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-500 hover:text-white print:hidden"
                  onClick={() => onSectionDelete("SHORT", secKey)}
                >
                  <FaTrash /> Delete Q.{qNumber}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {sectionQs.map((q, i) => (
                <div
                  key={getQId(q)}
                  className="relative flex flex-col mb-2 w-full"
                >
                  {isManualMode && (
                    <button
                      className="absolute -left-10 top-0 w-7 h-7 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center cursor-pointer text-xs transition-transform hover:scale-110 hover:bg-red-500 hover:text-white print:hidden z-10"
                      onClick={() => onManualDelete(getQId(q))}
                    >
                      <FaTrash />
                    </button>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold min-w-7">({i + 1})</span>
                    <div className="flex-1 text-left">
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
                    <div className="flex-1 text-right font-urdu" dir="rtl">
                      <span className="font-sans font-extrabold ml-2 inline-block">
                        ({i + 1})
                      </span>
                      {isManualMode ? (
                        <EditableField
                          isUrdu
                          value={q.statement?.ur || ""}
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
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ShortSection;
