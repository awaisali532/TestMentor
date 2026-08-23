import React from "react";
import { Edit2, Trash2, CheckCircle, Image as ImageIcon } from "lucide-react";
import RenderText from "../../../../components/ui/RenderText";

const QuestionItem = ({
  question,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  const isMcq = question.type === "MCQ";

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "MCQ":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
      case "SHORT":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "LONG":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div
      className={`group relative rounded-2xl bg-card border ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10"
          : "border-border hover:border-slate-300 dark:hover:border-slate-700"
      } p-5 shadow-xs transition-all duration-200 space-y-4`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(question._id)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${getTypeBadge(question.type)}`}>
            {question.type}
          </span>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty || "Medium"}
          </span>
          {question.questionCategory && (
            <span className="text-[10px] font-semibold text-muted bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md hidden sm:inline-block">
              {Array.isArray(question.questionCategory)
                ? question.questionCategory.join(", ")
                : question.questionCategory}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-main bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-border">
            {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
          </span>

          <button
            onClick={() => onEdit(question)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
            title="Edit Question"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(question._id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Language Question Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* English Statement */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
            English Statement
          </span>
          <div className="text-sm font-semibold text-main leading-relaxed">
            {question.statement?.en ? (
              <RenderText text={question.statement.en} />
            ) : (
              <span className="text-slate-400 italic">No English statement</span>
            )}
          </div>
        </div>

        {/* Urdu Statement */}
        <div className="space-y-1 text-right" dir="rtl">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            اردو سوال
          </span>
          <div className="text-base font-bold text-main leading-relaxed font-urdu">
            {question.statement?.ur ? (
              <RenderText text={question.statement.ur} />
            ) : (
              <span className="text-slate-400 italic font-sans text-xs">No Urdu statement</span>
            )}
          </div>
        </div>
      </div>

      {/* Attached Image / Diagram Display */}
      {question.image && (
        <div className="pt-2 border-t border-border/40">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Attached Diagram / Figure</span>
          </span>
          <div className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 max-w-md">
            <img
              src={typeof question.image === "object" ? question.image.url : question.image}
              alt="Question Diagram"
              className="max-h-60 w-auto rounded-xl object-contain mx-auto"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* MCQ Options Display */}
      {isMcq && question.options && question.options.length > 0 && (
        <div className="pt-2 border-t border-border/40">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
            Options
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {question.options.map((opt, idx) => {
              const enText = opt.en || opt.text?.en || "";
              const urText = opt.ur || opt.text?.ur || "";

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    opt.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-bold"
                      : "bg-slate-50 dark:bg-slate-800/60 border-border text-main"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-main shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex items-center justify-between w-full gap-2 overflow-hidden">
                      <span className="truncate">
                        {enText ? (
                          <RenderText text={enText} />
                        ) : (
                          <span className="text-slate-400 italic">No English</span>
                        )}
                      </span>
                      {urText && (
                        <span className="font-urdu font-bold text-right shrink-0" dir="rtl">
                          <RenderText text={urText} />
                        </span>
                      )}
                    </div>
                  </div>
                  {opt.isCorrect && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Indicator */}
      {question.image?.url && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
          <ImageIcon className="w-4 h-4" />
          <span>Diagram / Image Attached</span>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
