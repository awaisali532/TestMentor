import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaExclamationCircle, FaBook } from "react-icons/fa";
import Loader from "../../../../components/ui/Loader";

const SubjectSelector = ({ selectedClass, onSelect }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSubjects = async () => {
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
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects.");
      } finally {
        setLoading(false);
      }
    };
    if (selectedClass) fetchSubjects();
  }, [selectedClass]);

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

      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              onClick={() => onSelect(subject.subjectName)}
              className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer flex flex-col h-70 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-accent-1 transition-all duration-300 group"
            >
              {/* Image Box */}
              <div className="w-full h-45 bg-pill-bg border-b border-border flex items-center justify-center p-4">
                {subject.image && subject.image.url ? (
                  <img
                    src={subject.image.url}
                    alt={subject.subjectName}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <FaBook className="text-muted opacity-30 text-6xl" />
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 p-3 text-center flex flex-col justify-center items-center gap-1.5 bg-card">
                <h4 className="m-0 text-lg font-bold text-main leading-tight">
                  {subject.subjectName}
                </h4>
                <span className="text-xs text-accent-1 font-bold bg-accent-1/10 px-3 py-1 rounded-full">
                  {subject.year || "N/A"}
                </span>
              </div>
            </div>
          ))}
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
