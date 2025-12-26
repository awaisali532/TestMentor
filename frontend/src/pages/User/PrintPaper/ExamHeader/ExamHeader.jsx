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

  // Calculate Total MCQs
  const mcqCount =
    paperData.questions?.filter((q) => q.type === "MCQ").length || 0;
  // Agar MCQs na hon to sample k liye 5 dikha do, warna jitne hain utne
  const bubblesToShow = mcqCount > 0 ? mcqCount : 10;

  const ExamField = ({ label, value, widthClass }) => (
    <div className={`eh-field-box ${widthClass}`}>
      <span className="eh-field-label">{label}</span>
      <span className="eh-field-val">{value}</span>
    </div>
  );

  return (
    <div className="eh-container">
      {/* 1. TOP SECTION */}
      <div className="eh-top-section">
        <div className="eh-title-box">
          <h1
            className="eh-institute-name"
            style={{ transform: `scale(${settings.headerSize})` }}
          >
            {institute.name || "BRIGHT FUTURE SCHOOL SYSTEM & ACADEMY"}
          </h1>
          <p className="eh-address">
            {institute.address} {institute.phone && `PH: ${institute.phone}`}
          </p>
        </div>

        {/* Logo Right Side */}
        {institute.logo && (
          <div className="eh-logo-wrapper">
            <img src={institute.logo} alt="Logo" className="eh-logo" />
          </div>
        )}
      </div>

      {/* 2. GRID INFO */}
      <div className="eh-grid-wrapper">
        <div className="eh-row">
          <ExamField label="Student Name" value="" widthClass="w-40" />
          <ExamField label="Roll Number" value="" widthClass="w-20" />
          <ExamField
            label="Class Name"
            value={paperData.grade}
            widthClass="w-20"
          />
          <ExamField label="Paper Code" value="8280" widthClass="w-20" />
        </div>

        <div className="eh-row">
          <ExamField
            label="Subject Name"
            value={paperData.subject}
            widthClass="w-40"
          />
          <ExamField
            label="Time Allowed"
            value={paperData.selectedPattern?.timeAllowed || "2:00 Hours"}
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

        <div className="eh-row">
          <ExamField
            label="Exam Syllabus"
            value={
              paperData.topics?.length > 3
                ? `${paperData.topics[0].name}...`
                : paperData.topics?.map((t) => t.name).join(", ") || "Full Book"
            }
            widthClass="w-40"
          />
          <div className="eh-field-box w-20" style={{ flex: 1 }}>
            <span className="eh-field-label">Exam</span>
            <span className="eh-field-val">TEST SESSION</span>
          </div>
        </div>
      </div>

      {/* 3. BUBBLE SHEET STRIP (Grid Layout) */}
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
