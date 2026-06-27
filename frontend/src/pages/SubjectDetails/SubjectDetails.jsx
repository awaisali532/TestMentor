import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { useUser } from "../../context/UserContext";
import Loader from "../../components/ui/Loader";
import Reveal from "../../components/ui/Reveal";
import LoginModal from "../../components/ui/LoginModal"; // ✅ Global Modal

// Components
import ChapterAccordion from "./components/ChapterAccordion";
import CourseSidebar from "./components/CourseSidebar";

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // --- SMART FETCHING WITH DYNAMIC SWR CACHING ---
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      // 1. Har subject ke liye ek unique cache key banayi
      const cacheKey = `subjectDetailsData_${id}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      // 2. Agar data memory mein mojood hai toh foran dikha do (No Loading Screen)
      if (cachedData) {
        setData(JSON.parse(cachedData));
        setLoading(false);
      }

      // 3. Background mein hamesha fresh data mangwao
      try {
        const res = await axios.get(
          `${BASE_URL}/api/subjects/${id}/full-details`,
        );
        const freshData = res.data;

        // 4. Agar naya data purane se mukhtalif hai toh UI aur Cache dono update karo
        if (JSON.stringify(freshData) !== cachedData) {
          setData(freshData);
          sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load subject details.");
      } finally {
        // Agar pehli dafa load ho raha hai (cache nahi tha), tabhi loading false karo
        if (!cachedData) {
          setLoading(false);
        }
      }
    };

    fetchSubjectDetails();
  }, [id, BASE_URL]);

  const handleStartTest = (topicId) => {
    if (!user) {
      setShowLoginPopup(true);
    } else {
      navigate(`/test/topic/${topicId}`);
    }
  };

  if (loading) return <Loader text="Loading Syllabus..." />;
  if (!data)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted font-bold text-xl">
        Subject not found.
      </div>
    );

  const { subject, hierarchy } = data;

  return (
    <>
      <LoginModal
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="You need to login to attempt this test and save your progress."
      />

      <div className="min-h-screen bg-bg-body pt-18 pb-15 transition-colors duration-300">
        {/* 1. Hero Banner */}
        <div className="bg-card border-b border-border py-12 mb-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-pill-bg border border-border text-xs font-bold text-muted tracking-widest uppercase mb-4">
                {subject.className}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-main mb-3">
                {subject.subjectName}
              </h1>
              <p className="text-lg text-muted max-w-2xl">
                Master this subject with chapter-wise tests, detailed syllabus,
                and instant AI-driven results.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Split Layout (Main Content + Sidebar) */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Syllabus Accordion */}
            <div className="lg:col-span-8">
              <Reveal direction="up">
                <h3 className="text-2xl font-bold text-main mb-6 border-b border-border pb-4">
                  Course Syllabus
                </h3>
                <ChapterAccordion
                  hierarchy={hierarchy}
                  user={user}
                  onStartTest={handleStartTest}
                />
              </Reveal>
            </div>

            {/* Right Column: Sticky Sidebar */}
            <div className="lg:col-span-4 w-full">
              <Reveal direction="left" delay={200}>
                <CourseSidebar subject={subject} hierarchy={hierarchy} />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectDetails;
