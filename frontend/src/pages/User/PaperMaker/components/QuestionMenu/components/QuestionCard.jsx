import React, { useEffect } from "react";
import RenderText from "../../../../../../components/ui/RenderText";

const QuestionCard = ({
  question,
  index,
  isSelected,
  onToggle,
  medium = "BOTH",
}) => {
  // ✅ CONSOLE LOG: Debug data format for statements
  useEffect(() => {
    console.log(`[Q.${index}] Statement Data:`, question.statement);
  }, [question.statement, index]);

  const textEn = question.statement?.en || "";
  const textUr = question.statement?.ur || null;

  const showEn = medium === "BOTH" || medium === "EN";
  const showUr = medium === "BOTH" || medium === "UR";

  let rawCategory = question.questionCategory;
  if (Array.isArray(rawCategory))
    rawCategory = rawCategory.length > 0 ? rawCategory[0] : "General";

  const categoryClass = rawCategory
    ? String(rawCategory).toLowerCase().replace(/\s+/g, "")
    : "general";
  const categoryText = Array.isArray(question.questionCategory)
    ? question.questionCategory.join(", ")
    : question.questionCategory || "General";

  const getCategoryStyles = (cat) => {
    if (cat === "exercise") return "bg-[#3f6212] text-white";
    if (cat === "text" || cat === "conceptual") return "bg-blue-800 text-white";
    if (cat === "pastpaper") return "bg-purple-900 text-white";
    return "bg-slate-600 text-white";
  };

  const getDiffStyles = (diff) => {
    const lower = (diff || "").toLowerCase();
    if (lower === "easy") return "bg-emerald-500/15 text-emerald-600";
    if (lower === "medium") return "bg-amber-500/15 text-amber-600";
    if (lower === "hard") return "bg-red-500/15 text-red-600";
    return "bg-slate-500/15 text-slate-600";
  };

  return (
    <div
      onClick={() => onToggle(question)}
      // ✅ Original Classes Restored completely
      className={`relative bg-card border-b border-border py-1.5 px-2 flex gap-2 items-start cursor-pointer transition-colors ${
        isSelected ? "bg-emerald-500/10" : ""
      }`}
    >
      <div className="w-15 shrink-0 flex flex-col items-center gap-0.5 mt-0.5">
        <span className="font-extrabold text-accent-1 text-base leading-none">
          Q.{index}
        </span>
        <span
          className={`text-[0.5rem] px-1 py-0.5 w-full rounded-sm uppercase font-extrabold tracking-tight text-center leading-none truncate ${getCategoryStyles(
            categoryClass,
          )}`}
        >
          {categoryText}
        </span>
        {question.difficulty && (
          <span
            className={`text-[0.5rem] px-1 py-0.5 w-full rounded-sm uppercase font-extrabold tracking-tight text-center leading-none truncate ${getDiffStyles(
              question.difficulty,
            )}`}
          >
            {question.difficulty}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ✅ Dynamic Grid: if Both it takes 2 cols, if Single it takes 1 col (full width of its space) */}
        <div
          className={`grid grid-cols-1 ${medium === "BOTH" ? "md:grid-cols-2" : ""} gap-4 w-full items-start`}
        >
          {showEn && textEn && (
            <div className="text-left text-[0.95rem] font-medium leading-snug font-sans">
              <RenderText text={textEn} />
            </div>
          )}
          {showUr && textUr && (
            <div
              className="text-right urdu-font text-lg leading-none pt-1"
              dir="rtl"
            >
              <RenderText text={textUr} />
            </div>
          )}

          {/* Smart Fallback: Agar text nahi hai toh empty nahi chhorega */}
          {showUr && !textUr && textEn && medium === "UR" && (
            <div className="text-left text-[0.95rem] font-medium leading-snug font-sans opacity-60">
              <RenderText text={textEn} />{" "}
              <span className="text-[0.7rem] italic">(Urdu N/A)</span>
            </div>
          )}
          {showEn && !textEn && textUr && medium === "EN" && (
            <div
              className="text-right urdu-font text-lg leading-none pt-1 opacity-60"
              dir="rtl"
            >
              <RenderText text={textUr} />{" "}
              <span className="text-[0.7rem] italic font-sans">(Eng N/A)</span>
            </div>
          )}
        </div>

        {question.image?.url && (
          <div className="flex justify-center my-1 w-full">
            <img
              src={question.image.url}
              alt="Diagram"
              className="max-w-full max-h-16 border border-border object-contain"
            />
          </div>
        )}

        {question.type === "MCQ" && question.options?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-1 w-full">
            {question.options.map((opt, i) => {
              const isSameOption = opt.en?.trim() === opt.ur?.trim();
              return (
                <div key={i} className="flex items-start gap-1.5 w-full">
                  <span className="font-bold text-[0.85rem] text-slate-500 font-sans shrink-0">
                    ({String.fromCharCode(65 + i)})
                  </span>
                  {showEn && opt.en && (
                    <span className="text-[0.9rem] font-sans wrap-break-word">
                      <RenderText text={opt.en} />
                    </span>
                  )}
                  {showUr && opt.ur && (!isSameOption || !showEn) && (
                    <span
                      className="urdu-font text-lg wrap-break-word ml-1"
                      dir="rtl"
                    >
                      <RenderText text={opt.ur} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-6 shrink-0 flex justify-end mt-0.5">
        <div
          className={`w-4 h-4 border-2 rounded-sm transition-all duration-200 ${
            isSelected
              ? "bg-emerald-500 border-emerald-500"
              : "border-slate-300"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default React.memo(QuestionCard, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.question._id === nextProps.question._id &&
    prevProps.index === nextProps.index &&
    prevProps.medium === nextProps.medium
  );
});
