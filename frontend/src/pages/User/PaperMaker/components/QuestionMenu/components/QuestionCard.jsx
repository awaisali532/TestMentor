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
      className={`relative bg-card border border-border rounded-lg p-4 md:p-5 flex justify-between items-start cursor-pointer transition-all duration-300 z-1  hover:border-accent-1 hover:shadow-lg ${
        isSelected ? "bg-emerald-500/5 border-l-4 border-l-emerald-500" : ""
      }`}
    >
      <div className="flex-1 w-full flex gap-4">
        {/* Left Side: Q.Num & Badges */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 mt-0.5 min-w-12.5">
          <span className="font-extrabold text-accent-1 text-lg">
            Q.{index}
          </span>
          <span
            className={`text-[0.55rem] px-1.5 py-0.5 rounded-sm uppercase font-extrabold tracking-wider text-center ${getCategoryStyles(categoryClass)}`}
          >
            {categoryText}
          </span>
          {question.difficulty && (
            <span
              className={`text-[0.55rem] px-1.5 py-0.5 rounded-sm uppercase font-extrabold tracking-wider text-center ${getDiffStyles(question.difficulty)}`}
            >
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Right Side: Statements & MCQs */}
        <div className="flex-1 w-full">
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

          {question.image?.url && (
            <div className="flex justify-center my-4 w-full">
              <img
                src={question.image.url}
                alt="Diagram"
                className="max-w-full max-h-20 rounded-lg border border-border object-contain"
              />
            </div>
          )}

          {/* MCQ Options in 1 Line with Duplicate Check & Increased Spacing */}
          {question.type === "MCQ" && question.options?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-3 border-t border-dashed border-border w-full">
              {question.options.map((opt, i) => {
                // ✅ Logic to check if English and Urdu options are identical
                const isSameOption = opt.en?.trim() === opt.ur?.trim();

                return (
                  <div key={i} className="flex items-center gap-3 w-full">
                    <span className="font-bold text-[0.9rem] text-slate-500 font-sans shrink-0 pt-0.5">
                      ({String.fromCharCode(65 + i)})
                    </span>

                    {opt.en && (
                      <span className="text-[1rem] font-sans wrap-break-word pt-0.5">
                        <RenderText text={opt.en} />
                      </span>
                    )}

                    {/* ✅ Hides Urdu if it's the exact same as English, and added ml-3 for extra space */}
                    {opt.ur && !isSameOption && (
                      <span
                        className="urdu-font text-xl wrap-break-word ml-3"
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
      </div>

      <div className="pl-4 flex items-center h-full shrink-0">
        <div
          className={`w-5 h-5 border-2 rounded transition-all duration-200 ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}
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
