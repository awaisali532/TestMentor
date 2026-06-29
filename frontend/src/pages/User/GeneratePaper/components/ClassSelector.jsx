import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLayerGroup, FaGraduationCap } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../../../../components/ui/Loader";

const ClassSelector = ({ selectedClass, onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
      try {
        const token = localStorage.getItem("token");
        const [response] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          minDelay,
        ]);

        if (Array.isArray(response.data)) {
          const uniqueClasses = [
            ...new Set(
              response.data.map((item) => item.className).filter(Boolean),
            ),
          ].sort();
          setClasses(uniqueClasses);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <Loader fullScreen={false} text="Loading Classes..." />;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-main mb-2 tracking-tight">
          Choose Class Level
        </h2>
        <p className="text-muted text-lg">
          Select the grade you want to generate a paper for.
        </p>
      </div>

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
          {classes.map((cls, index) => (
            <div
              key={index}
              onClick={() => onSelect(cls)}
              className={`relative bg-card border rounded-2xl p-6 text-center cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-40 transition-all duration-300 group hover:-translate-y-2 hover:shadow-xl hover:border-accent-1 ${
                selectedClass === cls
                  ? "border-accent-1 bg-linear-to-br from-card to-accent-1/5 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]"
                  : "border-border shadow-sm"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-300 z-10 ${
                  selectedClass === cls
                    ? "bg-accent-1 text-white"
                    : "bg-pill-bg text-accent-1 group-hover:bg-accent-1 group-hover:text-white group-hover:scale-110 group-hover:-rotate-12"
                }`}
              >
                <FaGraduationCap />
              </div>
              <h3 className="text-xl font-bold text-main m-0 z-10">{cls}</h3>
              <div
                className={`text-sm mt-2 font-medium z-10 transition-all duration-300 ${selectedClass === cls ? "text-accent-1 opacity-100" : "text-muted opacity-50 group-hover:opacity-100 group-hover:text-accent-1"}`}
              >
                Tap to select
              </div>

              {/* Decorative Shape */}
              <div
                className={`absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,var(--pw-accent)_0%,transparent_60%)] opacity-0 transition-all duration-500 z-0 pointer-events-none ${selectedClass === cls ? "opacity-5" : "group-hover:opacity-5 group-hover:translate-x-[-10%] group-hover:translate-y-[10%]"}`}
              ></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-card border border-border rounded-2xl flex flex-col items-center">
          <FaLayerGroup className="text-6xl text-muted opacity-50 mb-4" />
          <p className="text-lg text-muted font-medium">
            No classes found in database.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassSelector;
