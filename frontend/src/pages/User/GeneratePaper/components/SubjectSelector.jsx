import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaExclamationCircle, FaBook, FaFire } from "react-icons/fa";
import Loader from "../../../../components/ui/Loader";

const SubjectImageWithSkeleton = ({ url, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!url || error) {
    return <FaBook className="text-muted opacity-30 text-6xl" />;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 bg-border/40 animate-pulse rounded-xl flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={url}
        alt={title}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-all duration-500 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
    </div>
  );
};

const SubjectSelector = ({ selectedClass, onSelect }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickCounts, setClickCounts] = useState(() => {
    try {
      const stored = localStorage.getItem("tm_subject_click_counts");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSubjects = async () => {
      const cacheKey = `tm_cache_subjects_${selectedClass}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        setSubjects(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
      try {
        setLoading(true);
        setError(null);
        const [response] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/subjects`, {
            params: { className: selectedClass },
          }),
          minDelay,
        ]);
        setSubjects(response.data);
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects.");
      } finally {
        setLoading(false);
      }
    };
    if (selectedClass) fetchSubjects();
  }, [selectedClass, API_BASE_URL]);

  // Sort subjects so most clicked / selected subjects appear at top
  const sortedSubjects = useMemo(() => {
    if (!subjects || subjects.length === 0) return [];
    return [...subjects].sort((a, b) => {
      const countA = clickCounts[a.subjectName] || 0;
      const countB = clickCounts[b.subjectName] || 0;
      if (countB !== countA) return countB - countA;
      return a.subjectName.localeCompare(b.subjectName);
    });
  }, [subjects, clickCounts]);

  const handleSubjectClick = (subjectName) => {
    // Record click count
    const updatedCounts = {
      ...clickCounts,
      [subjectName]: (clickCounts[subjectName] || 0) + 1,
    };
    setClickCounts(updatedCounts);
    try {
      localStorage.setItem(
        "tm_subject_click_counts",
        JSON.stringify(updatedCounts),
      );
    } catch (e) {
      console.error(e);
    }
    onSelect(subjectName);
  };

  if (loading)
    return (
      <Loader
        fullScreen={false}
        text={`Fetching Subjects for ${selectedClass}...`}
      />
    );
  if (error)
    return (
      <div className="text-center p-10 flex flex-col items-center text-red-500">
        <FaExclamationCircle className="text-4xl mb-3" />{" "}
        <p className="font-bold">{error}</p>
      </div>
    );

  const topClickedCount = sortedSubjects.length > 0 ? clickCounts[sortedSubjects[0].subjectName] || 0 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-main mb-2 tracking-tight">
          Select Subject for {selectedClass}
        </h2>
        <p className="text-muted text-lg">
          Choose a subject to see its syllabus.
        </p>
      </div>

      {sortedSubjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
          {sortedSubjects.map((subject, idx) => {
            const subjectClicks = clickCounts[subject.subjectName] || 0;
            const isTopSubject = idx === 0 && subjectClicks > 0 && topClickedCount > 0;

            return (
              <div
                key={subject._id}
                onClick={() => handleSubjectClick(subject.subjectName)}
                className={`relative bg-card border rounded-2xl overflow-hidden cursor-pointer flex flex-col h-70 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-accent-1 transition-all duration-300 group ${
                  isTopSubject ? "border-amber-400/60 ring-2 ring-amber-400/20" : "border-border"
                }`}
              >
                {isTopSubject && (
                  <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                    <FaFire /> MOST FREQUENT
                  </div>
                )}

                <div className="w-full h-45 bg-pill-bg border-b border-border flex items-center justify-center p-4 relative">
                  <SubjectImageWithSkeleton
                    url={subject.image?.url}
                    title={subject.subjectName}
                  />
                </div>
                <div className="flex-1 p-3 text-center flex flex-col justify-center items-center gap-1.5 bg-card">
                  <h4 className="m-0 text-lg font-bold text-main leading-tight">
                    {subject.subjectName}
                  </h4>
                  <span className="text-xs text-accent-1 font-bold bg-accent-1/10 px-3 py-1 rounded-full">
                    {subject.year || "N/A"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-12 bg-card border border-border rounded-2xl flex flex-col items-center col-span-full">
          <p className="text-lg text-muted font-medium">
            No subjects found for class {selectedClass}.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;
