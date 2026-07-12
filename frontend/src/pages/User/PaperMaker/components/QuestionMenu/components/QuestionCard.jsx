import React from "react";
import RenderText from "../../../../../../components/ui/RenderText";

const QuestionCard = ({ question, index, isSelected, onToggle }) => {
  const textEn = question.statement?.en || "";
  const textUr = question.statement?.ur || null;

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
      // ✅ Ultra-compact padding (py-1.5) aur sirf ek border-b
      className={`relative bg-card border-b border-border py-1.5 px-2 flex gap-2 items-start cursor-pointer transition-colors ${
        isSelected ? "bg-emerald-500/10" : ""
      }`}
    >
      {/* 1. STRICT FIXED LEFT COLUMN (60px) - Alignment kabhi kharab nahi hogi */}
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

      {/* 2. CENTER CONTENT (Takes remaining space) */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Statements (Tighter line-height) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
          {textEn && (
            <div className="text-left text-[0.95rem] font-medium leading-snug font-sans">
              <RenderText text={textEn} />
            </div>
          )}
          {textUr && (
            <div
              className="text-right urdu-font text-lg leading-none pt-1"
              dir="rtl"
            >
              <RenderText text={textUr} />
            </div>
          )}
        </div>

        {/* Image (Compact margins) */}
        {question.image?.url && (
          <div className="flex justify-center my-1 w-full">
            <img
              src={question.image.url}
              alt="Diagram"
              className="max-w-full max-h-16 border border-border object-contain"
            />
          </div>
        )}

        {/* MCQ Options (Tight spacing) */}
        {question.type === "MCQ" && question.options?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-1 w-full">
            {question.options.map((opt, i) => {
              const isSameOption = opt.en?.trim() === opt.ur?.trim();
              return (
                <div key={i} className="flex items-start gap-1.5 w-full">
                  <span className="font-bold text-[0.85rem] text-slate-500 font-sans shrink-0">
                    ({String.fromCharCode(65 + i)})
                  </span>
                  {opt.en && (
                    <span className="text-[0.9rem] font-sans wrap-break-word">
                      <RenderText text={opt.en} />
                    </span>
                  )}
                  {opt.ur && !isSameOption && (
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

      {/* 3. STRICT FIXED RIGHT COLUMN (Checkbox) */}
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
    prevProps.index === nextProps.index
  );
});
