import React from "react";
import { FaTrash } from "react-icons/fa";
import RenderText from "../../../../../components/ui/RenderText";
import EditableField from "./EditableField";

const LongSection = ({
  groupedLongQs,
  longInstr,
  shortQuestionsMap,
  isManualMode,
  onManualUpdate,
  onManualDelete,
  onSectionDelete,
  customHeadings,
  handleHeadingChange,
  paperMedium = "BOTH",
}) => {
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  if (!groupedLongQs || groupedLongQs.length === 0) return null;

  return (
    // ✅ FIX: mb-5 -> mb-4 print:mb-2
    <div className="mb-4 print:mb-2">
      <div className="flex justify-between items-center border-b border-dashed border-slate-800 print:border-black pb-1 mb-2 print:mb-1">
        {paperMedium !== "URDU" && (
          <div className="flex-1 text-left font-bold pp-text-en">
            {isManualMode ? (
              <EditableField
                value={
                  customHeadings.longEn ||
                  `<strong>Section II (Long Questions)</strong>`
                }
                onChange={(v) => handleHeadingChange("longEn", v)}
              />
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    customHeadings.longEn ||
                    `<strong>Section II (Long Questions)</strong>`,
                }}
              />
            )}
          </div>
        )}
        <div className="font-bold text-[0.7rem] px-2 whitespace-nowrap text-center pp-text-en">
          {isManualMode ? (
            <EditableField
              value={customHeadings.longInstrEn || longInstr.en}
              onChange={(v) => handleHeadingChange("longInstrEn", v)}
            />
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html: customHeadings.longInstrEn || longInstr.en,
              }}
            />
          )}
        </div>
        {paperMedium !== "ENGLISH" && (
          <div
            className="flex-1 text-right font-urdu font-bold pp-text-ur"
            dir="rtl"
          >
            {isManualMode ? (
              <EditableField
                isUrdu
                value={
                  customHeadings.longUr ||
                  `<strong>${longInstr.ur}</strong> (حصہ دوم)`
                }
                onChange={(v) => handleHeadingChange("longUr", v)}
              />
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    customHeadings.longUr ||
                    `<strong>${longInstr.ur}</strong> (حصہ دوم)`,
                }}
              />
            )}
          </div>
        )}
        {isManualMode && (
          <button
            className="ml-4 bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-500 hover:text-white print:hidden"
            onClick={() => onSectionDelete("LONG")}
          >
            <FaTrash /> Delete Sec II
          </button>
        )}
      </div>

      {/* ✅ FIX: gap-2 -> gap-2 print:gap-0.5 */}
      <div className="flex flex-col gap-2 print:gap-0.5">
        {groupedLongQs.map((group, groupIndex) => {
          const qNum = 2 + Object.keys(shortQuestionsMap).length + groupIndex;
          return group.map((q) => {
            const isA = q.tabId?.endsWith("_a");
            const isB = q.tabId?.endsWith("_b");
            const label = `Q.${qNum}${isA ? " (a)" : isB ? " (b)" : ""}`;
            const urLabel = `Q.${qNum}${isA ? " (الف)" : isB ? " (ب)" : ""}`;

            return (
              <div
                key={getQId(q)}
                // ✅ FIX: mb-2 -> mb-2 print:mb-0.5
                className="relative flex flex-col mb-2 print:mb-0.5 w-full break-inside-avoid"
              >
                {isManualMode && (
                  <button
                    className="absolute -left-10 top-0 w-7 h-7 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center cursor-pointer text-xs transition-transform hover:scale-110 hover:bg-red-500 hover:text-white print:hidden z-10"
                    onClick={() => onManualDelete(getQId(q))}
                  >
                    <FaTrash />
                  </button>
                )}

                <div className="flex items-start gap-2">
                  {paperMedium !== "URDU" && (
                    <>
                      <span className="font-extrabold min-w-10 pp-text-en">
                        {label}
                      </span>

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
                    </>
                  )}

                  {paperMedium !== "ENGLISH" && (
                    <div
                      className="flex-1 text-right font-urdu pp-text-ur"
                      dir="rtl"
                    >
                      <span className="font-sans font-extrabold ml-2 inline-block pp-text-ur">
                        {urLabel}
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
                  )}
                  <div className="font-bold ml-2 pp-text-en">[{q.marks}]</div>
                </div>
                {q.image && q.image.url && (
                  <div className="flex justify-center my-1 w-full">
                    <img
                      src={q.image.url}
                      alt="Diagram"
                      className="max-w-[80%] max-h-16 object-contain border border-border print:max-w-[60%] print:border-none"
                    />
                  </div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};

export default LongSection;
