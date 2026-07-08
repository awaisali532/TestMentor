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
}) => {
  const getQId = (q) => q.questionId?._id || q.questionId || q._id;

  if (!groupedLongQs || groupedLongQs.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center border-b border-dashed border-border print:border-black pb-2 mb-3">
        <div className="flex-1 text-left text-[0.9rem]">
          <strong className="text-[1rem]">Section II (Long Questions)</strong>
        </div>
        <div className="font-bold text-[0.7rem] px-2 whitespace-nowrap text-center">
          {longInstr.en}
        </div>
        <div
          className="flex-1 text-right font-urdu font-bold text-[0.9rem] print:text-[1rem]"
          dir="rtl"
        >
          <strong className="text-[1rem]">{longInstr.ur}</strong> (حصہ دوم)
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
                  {/* ✅ Increased size of Q.No */}
                  <span className="font-extrabold min-w-10 text-[0.9rem]">
                    {label}
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
                  <div className="font-bold ml-2 text-[0.85rem]">
                    [{q.marks}]
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
            );
          });
        })}
      </div>
    </div>
  );
};

export default LongSection;
