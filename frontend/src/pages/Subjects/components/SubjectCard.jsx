import React, { useState } from "react";
import {
  FaBookOpen,
  FaArrowRight,
  FaStar,
  FaTools,
  FaRegClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SubjectCard = ({ subject, activeClass }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  // STATIC FLAGS
  const isNew = true;
  const courseStatus = "Working";

  return (
    <div
      onClick={() => navigate(`/subjects/${subject._id}`)}
      className="group flex flex-col h-full bg-card border border-border text-main rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-accent-1/50 hover:shadow-2xl hover:shadow-accent-1/10 relative"
    >
      {/* 1. New/Updated Badge */}
      {isNew && (
        <div className="absolute top-3 left-3 z-20 bg-linear-to-r from-red-500 to-pink-500 backdrop-blur-md text-[10px] font-extrabold px-3 py-1 rounded-full text-white shadow-md uppercase tracking-wider animate-pulse">
          New
        </div>
      )}

      {/* 2. Class Badge */}
      <div className="absolute top-3 right-3 z-20 bg-bg-body/90 backdrop-blur-md border border-border text-[10px] font-bold px-3 py-1 rounded-full text-accent-1 shadow-sm uppercase tracking-wider">
        {activeClass}
      </div>

      {/* 3. Image Wrapper - ✅ Reduced padding to p-2 and added drop-shadow */}
      <div className="relative h-48 w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-2 border-b border-border overflow-hidden">
        {/* Skeleton Loader */}
        {subject.image && subject.image.url && !imgLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse z-10"></div>
        )}

        {subject.image && subject.image.url ? (
          <img
            src={subject.image.url}
            alt={subject.subjectName}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110 relative z-0 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <div className="text-slate-300 dark:text-slate-600 flex items-center justify-center size-full">
            <FaBookOpen size={50} />
          </div>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-20">
          <button className="w-full bg-white text-slate-900 border-none rounded-xl font-bold text-sm py-3 flex items-center justify-center transition-transform duration-200 hover:scale-105 cursor-pointer shadow-lg">
            Start Learning <FaArrowRight className="ml-2 text-accent-1" />
          </button>
        </div>
      </div>

      {/* 4. Card Body */}
      <div className="p-5 text-left bg-card grow flex flex-col justify-between">
        <div>
          <h5 className="font-extrabold text-lg text-main mb-2 line-clamp-2">
            {subject.subjectName}
          </h5>
        </div>

        {/* 5. Dynamic Status Area */}
        <div className="flex items-center gap-2 text-sm text-muted mt-3 pt-3 border-t border-border/50">
          {courseStatus === "Complete" && (
            <FaStar className="text-yellow-500" />
          )}
          {courseStatus === "Working" && <FaTools className="text-blue-500" />}
          {courseStatus === "Pending" && (
            <FaRegClock className="text-orange-500" />
          )}

          <span className="font-medium">
            {courseStatus === "Complete"
              ? "Complete Course"
              : courseStatus === "Working"
                ? "Upload in Progress"
                : "Pending Upload"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
