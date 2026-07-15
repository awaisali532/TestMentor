import React from "react";

const AnswerKey = ({ paperData }) => {
  const mcqs = paperData.questions?.filter((q) => q.type === "MCQ") || [];

  if (mcqs.length === 0) return null;

  const getCorrectOptionLabel = (question) => {
    if (!question.options) return "-";
    const correctIndex = question.options.findIndex(
      (opt) => opt.isCorrect === true,
    );
    if (correctIndex === -1) return "-";
    return String.fromCharCode(65 + correctIndex);
  };

  return (
    <div className="font-sans w-full">
      <h3 className="text-center border-b-2 border-black pb-2 text-xs uppercase font-bold text-black">
        Answer Key (MCQs)
      </h3>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-3">
        {mcqs.map((q, i) => (
          <div
            key={i}
            className="flex items-center justify-center gap-1.5 border border-black p-1 rounded bg-slate-100 print:bg-gray-200 text-black text-sm break-inside-avoid"
          >
            <strong className="text-black">{i + 1}.</strong>
            <span className="font-extrabold text-base">
              {getCorrectOptionLabel(q)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerKey;
