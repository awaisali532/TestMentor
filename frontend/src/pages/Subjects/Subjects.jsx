import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import SectionHeader from "../../components/ui/SectionHeader";
import Reveal from "../../components/ui/Reveal";
import Loader from "../../components/ui/Loader";

// Components
import ClassTabs from "./components/ClassTabs";
import SubjectCard from "./components/SubjectCard";

const Subjects = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [searchParams, setSearchParams] = useSearchParams();

  const [allSubjects, setAllSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeClass = searchParams.get("class") || "";

  // --- SWR CACHING LOGIC ---
  useEffect(() => {
    const fetchSubjects = async () => {
      const cachedData = sessionStorage.getItem("allSubjectsData");

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setAllSubjects(parsedData);
        extractClasses(parsedData);
        setLoading(false);
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/subjects`);
        const freshData = res.data;

        if (JSON.stringify(freshData) !== cachedData) {
          setAllSubjects(freshData);
          extractClasses(freshData);
          sessionStorage.setItem("allSubjectsData", JSON.stringify(freshData));
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        if (!cachedData) setLoading(false);
      }
    };

    fetchSubjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to extract unique classes
  const extractClasses = (data) => {
    const uniqueClasses = [
      ...new Set(data.map((item) => item.className)),
    ].sort();
    setClasses(uniqueClasses);

    // Agar URL mein koi class nahi hai aur data aa gaya hai, toh pehli class set kardo
    if (!searchParams.get("class") && uniqueClasses.length > 0) {
      setSearchParams({ class: uniqueClasses[0] }, { replace: true });
    }
  };

  const handleTabChange = (cls) => {
    setSearchParams({ class: cls });
  };

  const displayedSubjects = allSubjects.filter(
    (sub) => sub.className === activeClass,
  );

  // Hamara global premium loader chalega!
  if (loading) return <Loader text="Loading Subjects..." />;

  return (
    <div className="min-h-screen bg-bg-body pt-18 pb-15 transition-colors duration-300">
      {/* 1. Header Component */}
      <Reveal direction="up">
        <SectionHeader
          title="Explore"
          highlightWord="Subjects"
          subtitle="Select your class level to view available courses and syllabus."
        />
      </Reveal>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10">
        {classes.length > 0 ? (
          <>
            {/* 2. Tabs */}
            <Reveal direction="up" delay={100}>
              <ClassTabs
                classes={classes}
                activeClass={activeClass}
                onTabChange={handleTabChange}
              />
            </Reveal>

            {/* 3. Subject Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {displayedSubjects.length > 0 ? (
                displayedSubjects.map((subject, index) => (
                  <Reveal
                    key={subject._id}
                    direction="up"
                    delay={150 + index * 50}
                  >
                    <SubjectCard subject={subject} activeClass={activeClass} />
                  </Reveal>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-muted">
                  No subjects found for this class.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-main mb-2">
              No Subjects Available Yet
            </h3>
            <p className="text-muted">Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
