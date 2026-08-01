import React from "react";
import { FaGraduationCap, FaBook, FaLayerGroup, FaFileAlt } from "react-icons/fa";

const AutoHeader = ({ paperData }) => {
  const { grade, subject, title, syllabusLabel, selectedPattern } = paperData || {};
  const subjectName = typeof subject === "object" ? subject?.subjectName : subject;
  const patternName = selectedPattern?.name || "Standard Pattern";

  return (
    <div className="w-full max-w-2xl bg-card/80 backdrop-blur-md border border-border rounded-2xl p-5 mb-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <h3 className="text-xl font-bold text-main flex items-center gap-2">
          <FaFileAlt className="text-accent-1" />
          {title || "Untitled Paper"}
        </h3>
        <span className="bg-accent-1/10 text-accent-1 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          Auto Generator
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
        <div className="flex items-center gap-2 text-muted">
          <FaGraduationCap className="text-accent-1 shrink-0" />
          <span>Class: <strong className="text-main font-semibold">{grade || "N/A"}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <FaBook className="text-accent-1 shrink-0" />
          <span>Subject: <strong className="text-main font-semibold">{subjectName || "N/A"}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-muted col-span-2 md:col-span-1">
          <FaLayerGroup className="text-accent-1 shrink-0" />
          <span className="truncate">Pattern: <strong className="text-main font-semibold">{patternName}</strong></span>
        </div>
      </div>

      {syllabusLabel && (
        <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted flex items-center gap-1.5">
          <span className="font-semibold text-main">Syllabus:</span> {syllabusLabel}
        </div>
      )}
    </div>
  );
};

export default React.memo(AutoHeader);
