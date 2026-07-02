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
      className={`relative bg-card border-x border-b border-border p-4 md:p-5 flex justify-between items-start cursor-pointer transition-all duration-300 z-1 first-of-type:border-t hover:-translate-y-0.75 hover:border-accent-1 hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.15)] hover:z-10 ${
        isSelected ? "bg-emerald-500/5 border-l-4 border-l-emerald-500!" : ""
      }`}
    >
      <div className="flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full items-start">
          <div className="text-left text-base font-medium leading-relaxed">
            <span className="font-extrabold mr-2 text-accent-1">
              Q.{index}{" "}
            </span>
            <RenderText text={textEn} />
          </div>
          {textUr && (
            <div
              className="text-right font-[Jameel_Noori_Nastaleeq] text-xl leading-relaxed"
              dir="rtl"
            >
              <span className="font-extrabold ml-2.5 text-accent-1 inline-block font-sans">
                {index}.
              </span>
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

        {question.type === "MCQ" && question.options?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4 pt-3 border-t border-dashed border-border">
            {question.options.map((opt, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[0.9rem] text-slate-500">
                    ({String.fromCharCode(65 + i)})
                  </span>
                  <span className="text-[0.95rem]">
                    <RenderText text={opt.en || ""} />
                  </span>
                </div>
                {opt.ur && (
                  <div
                    className="font-[Jameel_Noori_Nastaleeq] text-[1.1rem]"
                    dir="rtl"
                  >
                    <RenderText text={opt.ur} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <span
              className={`text-[0.7rem] px-2.5 py-1 rounded-md uppercase font-bold tracking-wider ${getCategoryStyles(categoryClass)}`}
            >
              {categoryText}
            </span>
            {question.difficulty && (
              <span
                className={`text-[0.7rem] px-2.5 py-1 rounded-md uppercase font-bold tracking-wider ${getDiffStyles(question.difficulty)}`}
              >
                {question.difficulty}
              </span>
            )}
          </div>
          <span className="text-[0.8rem] text-slate-400 font-semibold">
            Marks: {question.marks}
          </span>
        </div>
      </div>

      <div className="pl-4 flex items-center h-full">
        <div
          className={`w-5 h-5 border-2 rounded transition-all duration-200 ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}
        ></div>
      </div>
    </div>
  );
};

// 🔥 THE LAG KILLER: React.memo with custom comparison
// Yeh srif tab render hoga jab is specific card ka 'isSelected' status change ho
export default React.memo(QuestionCard, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.question._id === nextProps.question._id &&
    prevProps.index === nextProps.index
  );
});
