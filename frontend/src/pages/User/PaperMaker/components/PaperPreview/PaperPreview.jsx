import React from "react";
import { FaRegFileAlt } from "react-icons/fa";
import McqSection from "./McqSection";
import ShortSection from "./ShortSection";
import LongSection from "./LongSection";
import { useUser } from "../../../../../context/UserContext";
import EditableField from "./EditableField";

const PaperPreview = ({
  paperData,
  onOpenMenu,
  isPrintMode = false,
  isManualMode,
  onManualUpdate,
  onManualDelete,
  onSectionDelete,
  separateObjective = false,
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

  const customHeadings = paperData?.paperPattern?.customHeadings || {};
  const handleHeadingChange = (key, val) => {
    if (paperData && paperData.paperPattern) {
      if (!paperData.paperPattern.customHeadings) {
        paperData.paperPattern.customHeadings = {};
      }
      paperData.paperPattern.customHeadings[key] = val;
    }
  };

  const paperMedium =
    paperData?.selectedPattern?.medium ||
    paperData?.paperPattern?.medium ||
    paperData?.medium ||
    "BOTH";

  return (
    <div
      className={`w-full h-full relative text-[0.85rem] transition-all duration-200 ${isManualMode ? "ring-2 ring-dashed ring-accent-1/60 rounded-sm bg-accent-1/[0.02]" : ""}`}
    >
      <style>{` .items-baseline { align-items: flex-start !important; } `}</style>

      {/* ✅ WATERMARK FIX: Jab print mode hoga toh ye gayab ho jayega */}
      {instituteLogo && !isPrintMode && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 print:hidden">
          <div className="sticky top-0 w-full h-[80vh] flex justify-center items-center">
            <img
              src={instituteLogo}
              alt="Watermark"
              className="w-100 h-100 object-contain opacity-[0.1] dark:opacity-[0.1] "
            />
          </div>
        </div>
      )}

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
              customHeadings={customHeadings}
              handleHeadingChange={handleHeadingChange}
              paperMedium={paperMedium}
            />
            {separateObjective && mcqs.length > 0 && hasSubjective && (
              <div
                className="w-full print:block"
                style={{ pageBreakAfter: "always", breakAfter: "page" }}
              />
            )}
            {hasSubjective && (
              <div className="mb-6">
                <div className="flex justify-center items-center gap-4 border-b-2 border-main print:border-black uppercase pb-1 mb-4 transition-colors duration-300">
                  {paperMedium !== "URDU" && (
                    isManualMode ? (
                      <EditableField
                        value={customHeadings.subjEn || "Subjective Part"}
                        onChange={(v) => handleHeadingChange("subjEn", v)}
                        className="font-bold text-xl! print:text-xl!"
                      />
                    ) : (
                      <span
                        className="font-bold text-xl! print:text-xl!"
                        dangerouslySetInnerHTML={{
                          __html: customHeadings.subjEn || "Subjective Part",
                        }}
                      />
                    )
                  )}
                  {paperMedium === "BOTH" && (
                    <span className="font-light opacity-50 text-xl!">|</span>
                  )}
                  {paperMedium !== "ENGLISH" && (
                    isManualMode ? (
                      <EditableField
                        isUrdu
                        value={customHeadings.subjUr || "حصہ انشائیہ"}
                        onChange={(v) => handleHeadingChange("subjUr", v)}
                        className="font-urdu font-bold text-xl! print:text-xl!"
                      />
                    ) : (
                      <span
                        className="font-urdu font-bold text-xl! print:text-xl!"
                        dir="rtl"
                        dangerouslySetInnerHTML={{
                          __html: customHeadings.subjUr || "حصہ انشائیہ",
                        }}
                      />
                    )
                  )}
                </div>
                <ShortSection
                  shortQuestionsMap={shortQuestionsMap}
                  getSectionConfig={getSectionConfig}
                  isManualMode={isManualMode}
                  onManualUpdate={onManualUpdate}
                  onManualDelete={onManualDelete}
                  onSectionDelete={onSectionDelete}
                  customHeadings={customHeadings}
                  handleHeadingChange={handleHeadingChange}
                  paperMedium={paperMedium}
                />
                <LongSection
                  groupedLongQs={getGroupedLongQuestions()}
                  longInstr={getLongInstructions()}
                  shortQuestionsMap={shortQuestionsMap}
                  isManualMode={isManualMode}
                  onManualUpdate={onManualUpdate}
                  onManualDelete={onManualDelete}
                  onSectionDelete={onSectionDelete}
                  customHeadings={customHeadings}
                  handleHeadingChange={handleHeadingChange}
                  paperMedium={paperMedium}
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
