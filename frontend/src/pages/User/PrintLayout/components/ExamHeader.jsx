import React from "react";

const ExamHeader = ({ paperData, settings, institute }) => {
  const formattedDate = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");

  const pattern = paperData.selectedPattern || paperData.paperPattern || {};

  const getExamTypeLabel = () => {
    if (paperData.examLabel?.trim() !== "") return paperData.examLabel;
    switch (pattern.type) {
      case "FULL_BOOK":
        return "Full Book Test";
      case "HALF_BOOK":
        return "Half Book Test";
      case "CHAPTER_WISE":
        return "Chapter Wise Test";
      default:
        return "Test Session";
    }
  };

  // ✅ SMART FALLBACK: Agar topics khali hain toh examLabel (CH-1) show karega
  const getSyllabusText = () => {
    if (
      paperData.syllabusLabel &&
      paperData.syllabusLabel !== "Select Syllabus"
    )
      return paperData.syllabusLabel;

    if (paperData.topics && paperData.topics.length > 0) {
      const names = paperData.topics.map((t) => t.name || t);
      if (names.length > 5)
        return `${names.slice(0, 3).join(", ")} & ${names.length - 3} More`;
      return names.join(", ");
    }

    if (paperData.examLabel && paperData.examLabel.trim() !== "") {
      return paperData.examLabel;
    }
    return "Full Book";
  };

  const getPaperCode = () =>
    paperData._id
      ? paperData._id.slice(-4).toUpperCase()
      : Math.floor(1000 + Math.random() * 9000);

  const mcqCount =
    paperData.questions?.filter((q) => q.type === "MCQ").length || 0;
  const bubblesToShow = mcqCount > 0 ? mcqCount : 10;

  const ExamField = ({ label, value, flex }) => (
    <div
      className="relative border border-black h-7 flex items-center px-2 mt-2 bg-transparent"
      style={{ flex }}
    >
      <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-black leading-none">
        {label}
      </span>
      <span className="font-bold w-full text-center uppercase text-xs text-black">
        {value}
      </span>
    </div>
  );

  return (
    <div className="w-full font-serif text-black relative box-border print:text-black">
      <div className="flex items-center justify-between pt-2">
        <div className="flex-1 text-center">
          <h1
            className="text-[26px] font-black uppercase m-0 leading-tight text-black"
            style={{ transform: `scale(${settings.headerSize || 1})` }}
          >
            {institute.name}
          </h1>
          <p className="text-[12px] font-bold mt-1 uppercase text-black">
            {institute.address} {institute.phone && `PH: ${institute.phone}`}
          </p>
        </div>
        {institute.logo && (
          <div className="w-21.25 h-21.25 flex items-center justify-center ml-4">
            <img
              src={institute.logo}
              alt="Logo"
              className="max-w-full max-h-full object-contain grayscale"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col w-full mt-2">
        <div className="flex gap-2 w-full">
          <ExamField label="Student Name" value="" flex={4} />
          <ExamField label="Roll Number" value="" flex={2} />
          <ExamField label="Class Name" value={paperData.grade} flex={2} />
          <ExamField label="Paper Code" value={getPaperCode()} flex={2} />
        </div>

        <div className="flex gap-2 w-full mt-1">
          <ExamField label="Subject Name" value={paperData.subject} flex={3} />
          <ExamField
            label="Time Allowed"
            value={pattern.timeAllowed || "2:00 Hours"}
            flex={2}
          />
          <ExamField
            label="Total Marks"
            value={paperData.totalMarks}
            flex={2}
          />
          <ExamField label="Exam Date" value={formattedDate} flex={2} />
        </div>

        {settings.showSyllabus && (
          <div className="flex gap-2 w-full mt-1">
            <ExamField
              label="Exam Syllabus"
              value={getSyllabusText()}
              flex={3}
            />
            <div
              className="relative border border-black h-7 flex items-center px-2 mt-2 bg-transparent"
              style={{ flex: 1 }}
            >
              <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-black leading-none">
                Exam
              </span>
              <span className="font-bold w-full text-center uppercase text-xs text-black">
                {getExamTypeLabel()}
              </span>
            </div>
          </div>
        )}
      </div>

      {settings.showBubbleSheet && (
        <div className="grid grid-cols-4 gap-x-2 gap-y-1 mt-3 p-1.5 border border-black">
          {Array.from({ length: bubblesToShow }).map((_, i) => (
            <div key={i} className="flex items-center justify-center gap-1.5">
              <span className="font-bold text-[11px] min-w-3.75 text-right text-black">
                {i + 1}.
              </span>
              <div className="flex gap-0.5">
                {["A", "B", "C", "D"].map((opt) => (
                  <div
                    key={opt}
                    className="w-3.5 h-3.5 border border-black rounded-full flex items-center justify-center text-[8px] font-bold text-black"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamHeader;
