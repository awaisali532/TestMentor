import React from "react";
import "./ExamHeader.css";

const ExamHeader = ({ paperData, settings, institute }) => {
  const formattedDate = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");

  const pattern = paperData.selectedPattern || paperData.paperPattern || {};

  // --- 1. LOGIC: EXAM TYPE ---
  const getExamTypeLabel = () => {
    if (paperData.examLabel && paperData.examLabel.trim() !== "") {
      return paperData.examLabel;
    }
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

  // --- 2. LOGIC: SYLLABUS ---
  const getSyllabusText = () => {
    if (
      paperData.syllabusLabel &&
      paperData.syllabusLabel !== "Select Syllabus"
    ) {
      return paperData.syllabusLabel;
    }
    if (paperData.topics && paperData.topics.length > 0) {
      const names = paperData.topics.map((t) => t.name || t);
      if (names.length > 5) {
        return `${names.slice(0, 3).join(", ")} & ${names.length - 3} More`;
      }
      return names.join(", ");
    }
    return "Full Book";
  };

  // --- 3. LOGIC: PAPER CODE (Dynamic) ---
  const getPaperCode = () => {
    if (paperData._id) {
      return paperData._id.slice(-4).toUpperCase();
    }
    return Math.floor(1000 + Math.random() * 9000);
  };

  const mcqCount =
    paperData.questions?.filter((q) => q.type === "MCQ").length || 0;
  const bubblesToShow = mcqCount > 0 ? mcqCount : 10;

  const ExamField = ({ label, value, widthClass }) => (
    <div className={`eh-field-box ${widthClass}`}>
      <span className="eh-field-label">{label}</span>
      <span className="eh-field-val">{value}</span>
    </div>
  );

  return (
    <div className="eh-container">
      {/* TOP SECTION */}
      <div className="eh-top-section">
        <div className="eh-title-box">
          <h1
            className="eh-institute-name"
            style={{ transform: `scale(${settings.headerSize})` }}
          >
            {institute.name}
          </h1>
          <p className="eh-address">
            {institute.address} {institute.phone && `PH: ${institute.phone}`}
          </p>
        </div>

        {institute.logo && (
          <div className="eh-logo-wrapper">
            <img src={institute.logo} alt="Logo" className="eh-logo" />
          </div>
        )}
      </div>

      {/* GRID INFO */}
      <div className="eh-grid-wrapper">
        {/* ROW 1: Student Details */}
        <div className="eh-row">
          <ExamField label="Student Name" value="" widthClass="w-40" />
          <ExamField label="Roll Number" value="" widthClass="w-20" />
          <ExamField
            label="Class Name"
            value={paperData.grade}
            widthClass="w-20"
          />
          <ExamField
            label="Paper Code"
            value={getPaperCode()}
            widthClass="w-20"
          />
        </div>

        {/* ROW 2: Paper Details */}
        <div className="eh-row">
          <ExamField
            label="Subject Name"
            value={paperData.subject}
            widthClass="w-40"
          />
          <ExamField
            label="Time Allowed"
            value={pattern.timeAllowed || "2:00 Hours"}
            widthClass="w-20"
          />
          <ExamField
            label="Total Marks"
            value={paperData.totalMarks}
            widthClass="w-20"
          />
          <ExamField
            label="Exam Date"
            value={formattedDate}
            widthClass="w-20"
          />
        </div>

        {/* ✅ ROW 3: SYLLABUS & EXAM TYPE (CONDITIONAL RENDERING) */}
        {/* Ye row sirf tab dikhegi jab settings.showSyllabus TRUE hoga */}
        {settings.showSyllabus && (
          <div className="eh-row">
            <ExamField
              label="Exam Syllabus"
              value={getSyllabusText()}
              widthClass="w-40"
            />
            <div className="eh-field-box w-20" style={{ flex: 1 }}>
              <span className="eh-field-label">Exam</span>
              <span className="eh-field-val">{getExamTypeLabel()}</span>
            </div>
          </div>
        )}
      </div>

      {/* BUBBLE SHEET STRIP */}
      {settings.showBubbleSheet && (
        <div className="eh-bubble-strip">
          {Array.from({ length: bubblesToShow }).map((_, i) => (
            <div key={i} className="eh-bubble-group">
              <span className="eh-q-num">{i + 1}.</span>
              <div className="eh-bubbles">
                {["A", "B", "C", "D"].map((opt) => (
                  <div key={opt} className="eh-circle">
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
