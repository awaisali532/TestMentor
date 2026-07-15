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
}) => {
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  if (!groupedLongQs || groupedLongQs.length === 0) return null;

  return (
    <div className="mb-5 long-q-item">
      <div className="flex justify-between items-center border-b border-dashed border-border print:border-black pb-2 mb-3">
        <div className="flex-1 text-left text-xl! font-bold pp-hd-en">
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
        <div className="font-bold text-[0.7rem] px-2 whitespace-nowrap text-center pp-hd-en">
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
        <div
          className="flex-1 text-right font-urdu font-bold text-xl! print:text-xl! pp-hd-ur"
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
        {isManualMode && (
          <button
            className="ml-4 bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-500 hover:text-white print:hidden"
            onClick={() => onSectionDelete("LONG")}
          >
            <FaTrash /> Delete Sec II
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
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
                  <span className="font-extrabold min-w-10 pp-text-en">
                    {label}
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
                  <div
                    className="flex-1 text-right font-urdu pp-text-ur"
                    dir="rtl"
                  >
                    <span className="font-sans font-extrabold ml-2 inline-block">
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
                  <div className="font-bold ml-2 pp-text-en">[{q.marks}]</div>
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
            );
          });
        })}
      </div>
    </div>
  );
};

export default LongSection;
