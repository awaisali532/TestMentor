import React from "react";
import { FaBookOpen, FaListUl, FaGraduationCap } from "react-icons/fa";

const CourseSidebar = ({ subject, hierarchy }) => {
  const totalTopics = hierarchy.reduce(
    (acc, curr) => acc + curr.topics.length,
    0,
  );

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl sticky top-28">
      {/* Subject Icon Box - ✅ Height adjusted to h-48, p-3 added, image takes full size */}
      <div className="h-48 w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-border p-3 overflow-hidden">
        {subject.image && subject.image.url ? (
          <img
            src={subject.image.url}
            alt={subject.subjectName}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        ) : (
          <FaBookOpen
            size={60}
            className="text-slate-300 dark:text-slate-600"
          />
        )}
      </div>

      <h4 className="font-extrabold text-xl text-main mb-4">Course Summary</h4>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3 text-muted">
          <div className="size-10 rounded-full bg-pill-bg flex items-center justify-center text-accent-1">
            <FaGraduationCap />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider m-0">
              Target Class
            </p>
            <p className="text-main font-semibold m-0">{subject.className}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-muted">
          <div className="size-10 rounded-full bg-pill-bg flex items-center justify-center text-accent-1">
            <FaBookOpen />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider m-0">
              Total Chapters
            </p>
            <p className="text-main font-semibold m-0">{hierarchy.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-muted">
          <div className="size-10 rounded-full bg-pill-bg flex items-center justify-center text-accent-1">
            <FaListUl />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider m-0">
              Total Topics
            </p>
            <p className="text-main font-semibold m-0">{totalTopics}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted text-center italic mt-4">
        Select a topic from the syllabus to begin your preparation.
      </p>
    </div>
  );
};

export default CourseSidebar;
