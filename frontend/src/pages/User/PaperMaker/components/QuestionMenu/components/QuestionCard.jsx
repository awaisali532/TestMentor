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
      className={`relative bg-card border-b border-border p-3 md:p-4 flex gap-3 cursor-pointer transition-colors ${
        isSelected ? "bg-emerald-500/10" : "hover:bg-pill-bg/30"
      }`}
    >
      {/* 1. FIXED LEFT COLUMN: Sirf Q.No */}
      <div className="w-10 shrink-0 mt-0.5">
        <span className="font-extrabold text-accent-1 text-lg">Q.{index}</span>
      </div>

      {/* 2. CENTER COLUMN: Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
        {/* Statements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full items-start">
          {textEn && (
            <div className="text-left text-lg font-medium leading-relaxed font-sans">
              <RenderText text={textEn} />
            </div>
          )}
          {textUr && (
            <div
              className="text-right urdu-font text-xl leading-relaxed"
              dir="rtl"
            >
              <RenderText text={textUr} />
            </div>
          )}
        </div>

        {/* Image */}
        {question.image?.url && (
          <div className="flex justify-center my-1 w-full">
            <img
              src={question.image.url}
              alt="Diagram"
              className="max-w-full max-h-20 rounded border border-border object-contain"
            />
          </div>
        )}

        {/* MCQ Options in 1 Line */}
        {question.type === "MCQ" && question.options?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-1 border-t border-dashed border-border/50 pt-2 w-full">
            {question.options.map((opt, i) => {
              const isSameOption = opt.en?.trim() === opt.ur?.trim();
              return (
                <div key={i} className="flex items-start gap-2 w-full">
                  <span className="font-bold text-[0.9rem] text-slate-500 font-sans shrink-0 mt-0.5">
                    ({String.fromCharCode(65 + i)})
                  </span>
                  {opt.en && (
                    <span className="text-[1rem] font-sans wrap-break-word mt-0.5">
                      <RenderText text={opt.en} />
                    </span>
                  )}
                  {opt.ur && !isSameOption && (
                    <span
                      className="urdu-font text-xl wrap-break-word ml-2"
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

        {/* 3. NEW POSITION FOR BADGES: Subtle Footer Row */}
        {/* Yeh line text ki horizontal alignment ko kabhi kharab nahi karegi */}
        <div className="flex flex-wrap gap-2 mt-1 opacity-90">
          <span
            className={`text-[0.6rem] px-2 py-0.5 rounded uppercase font-extrabold tracking-wider leading-none ${getCategoryStyles(
              categoryClass,
            )}`}
          >
            {categoryText}
          </span>
          {question.difficulty && (
            <span
              className={`text-[0.6rem] px-2 py-0.5 rounded uppercase font-extrabold tracking-wider leading-none ${getDiffStyles(
                question.difficulty,
              )}`}
            >
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* 4. FIXED RIGHT COLUMN: Sirf Checkbox */}
      <div className="w-7.5 shrink-0 flex items-center justify-end">
        <div
          className={`w-5 h-5 border-2 rounded transition-all duration-200 ${
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
