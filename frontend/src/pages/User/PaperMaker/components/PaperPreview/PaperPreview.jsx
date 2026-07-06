import React from "react";
import { FaRegFileAlt } from "react-icons/fa";
import McqSection from "./McqSection";
import ShortSection from "./ShortSection";
import LongSection from "./LongSection";
import { useUser } from "../../../../../context/UserContext";

const PaperPreview = ({
  paperData,
  onOpenMenu,
  isPrintMode = false,
  isManualMode,
  onManualUpdate,
  onManualDelete,
  onSectionDelete,
}) => {
  const { user } = useUser();
  const instituteLogo =
    user?.institute?.logo?.url ||
    user?.institute?.image ||
    user?.institute?.logo ||
    null;

  const questions = paperData?.questions || [];
  const mcqs = questions.filter((q) => q.type === "MCQ");

  const shortQuestionsMap = {};
  questions
    .filter((q) => q.type === "SHORT")
    .forEach((q) => {
      const key = q.tabId || "General";
      if (!shortQuestionsMap[key]) shortQuestionsMap[key] = [];
      shortQuestionsMap[key].push(q);
    });

  const longQs = questions.filter((q) => q.type === "LONG");
  const hasQuestions = questions.length > 0;
  const hasSubjective =
    Object.keys(shortQuestionsMap).length > 0 || longQs.length > 0;

  const getSectionConfig = (type, index = null) => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    const sections = pattern?.sections || [];
    if (type === "LONG") return sections.find((s) => s.questionType === "LONG");
    return sections.filter((s) => s.questionType === "SHORT")[index];
  };

  const getGroupedLongQuestions = () => {
    const grouped = {};
    longQs.forEach((q) => {
      const parts = q.tabId ? q.tabId.split("_") : [];
      if (parts.length >= 4) {
        const groupKey = `${parts[0]}_${parts[1]}_${parts[2]}`;
        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push(q);
      } else {
        grouped[q._id] = [q];
      }
    });
    return Object.keys(grouped)
      .sort()
      .map((key) =>
        grouped[key].sort((a, b) =>
          (a.tabId || "").localeCompare(b.tabId || ""),
        ),
      );
  };

  const getLongInstructions = () => {
    const pattern = paperData?.selectedPattern || paperData?.paperPattern;
    const attemptLimit = parseInt(pattern?.longQAttemptCount || 0);
    const available = getGroupedLongQuestions().length;
    const compulsorySec = (pattern?.sections || [])
      .filter((s) => s.questionType === "LONG")
      .find((s) => s.isCompulsory === true);

    let enText = "",
      urText = "";
    if (attemptLimit === 0 || attemptLimit >= available) {
      enText = "Note: Attempt all questions.";
      urText = "نوٹ: تمام سوالات حل کریں۔";
    } else {
      enText = `Note: Attempt any ${attemptLimit} ${attemptLimit === 1 ? "question" : "questions"}${compulsorySec ? ` (${compulsorySec.questionNo} is compulsory).` : "."}`;
      urText = `نوٹ: کوئی سے ${attemptLimit} سوالات حل کریں${compulsorySec ? ` (${compulsorySec.questionNo} لازمی ہے)۔` : "۔"}`;
    }
    return { en: enText, ur: urText };
  };

  return (
    <div
      className={`w-full h-full relative text-[0.85rem] ${isManualMode ? "border-[3px] border-dashed border-accent-1/50 bg-accent-1/5 p-6 rounded-md shadow-inner" : ""}`}
    >
      <style>{` .items-baseline { align-items: flex-start !important; } `}</style>

      {/* ✅ ULTIMATE CSS TRICK FIX: 
          1. Absolute div creates a full-height track over the white canvas.
          2. Sticky div is exactly 80vh tall and centers the image perfectly inside it.
          3. This guarantees it works beautifully when empty AND when scrolling! */}
      {instituteLogo && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 print:fixed print:inset-0 print:flex print:justify-center print:items-center">
          <div className="sticky top-0 w-full h-[80vh] flex justify-center items-center print:static print:h-auto print:w-auto">
            <img
              src={instituteLogo}
              alt="Watermark"
              className="w-100 h-100 object-contain opacity-[0.1] dark:opacity-[0.1] "
            />
          </div>
        </div>
      )}

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full">
        {!hasQuestions ? (
          <div className="flex flex-col items-center justify-start pt-20 h-full text-muted opacity-80 print:hidden">
            <FaRegFileAlt className="text-6xl mb-4" />
            <h3 className="text-xl font-bold">Paper Empty</h3>
            <p>Select questions from the menu.</p>
          </div>
        ) : (
          <>
            <McqSection
              mcqs={mcqs}
              isManualMode={isManualMode}
              onManualUpdate={onManualUpdate}
              onManualDelete={onManualDelete}
              onSectionDelete={onSectionDelete}
            />
            {hasSubjective && (
              <div className="mb-6">
                <div className="flex justify-center items-center gap-4 border-b-2 border-main print:border-black font-extrabold uppercase text-[0.9rem] pb-1 mb-4 transition-colors duration-300">
                  <span className="text-[0.8rem] print:text-[0.9rem]">
                    Subjective Part
                  </span>
                  <span className="font-light opacity-50 text-[1.1rem]">|</span>
                  <span
                    className="font-[Jameel_Noori_Nastaleeq] text-[1.1rem] print:text-[1.2rem]"
                    dir="rtl"
                  >
                    حصہ انشائیہ
                  </span>
                </div>
                <ShortSection
                  shortQuestionsMap={shortQuestionsMap}
                  getSectionConfig={getSectionConfig}
                  isManualMode={isManualMode}
                  onManualUpdate={onManualUpdate}
                  onManualDelete={onManualDelete}
                  onSectionDelete={onSectionDelete}
                />
                <LongSection
                  groupedLongQs={getGroupedLongQuestions()}
                  longInstr={getLongInstructions()}
                  shortQuestionsMap={shortQuestionsMap}
                  isManualMode={isManualMode}
                  onManualUpdate={onManualUpdate}
                  onManualDelete={onManualDelete}
                  onSectionDelete={onSectionDelete}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PaperPreview);
