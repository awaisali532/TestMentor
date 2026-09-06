import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BookOpen,
  Layers,
  FolderTree,
  Sparkles,
  RefreshCw,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

import SubjectsBreadcrumbs from "./components/SubjectsBreadcrumbs";
import ClassSection from "./components/ClassSection";
import SubjectSection from "./components/SubjectSection";
import ChapterSection from "./components/ChapterSection";

const AdminSubjects = () => {
  // Stepper state
  const [activeStep, setActiveStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Global subject repository for quick metrics & counts
  const [allSubjects, setAllSubjects] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchGlobalData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects`);
      setAllSubjects(res.data || []);
    } catch (err) {
      console.error("Error fetching subjects global:", err);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    console.log("✅ AdminSubjects module loaded successfully!");
    fetchGlobalData();
  }, [fetchGlobalData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGlobalData();
    toast.success("Subjects data refreshed!");
  };

  // Step 1: Select Class -> Move to Step 2
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setActiveStep(2);
  };

  // Step 2: Select Subject -> Move to Step 3
  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setActiveStep(3);
  };

  // Stepper Header Click
  const handleStepClick = (targetStep) => {
    if (targetStep === 1) {
      setActiveStep(1);
      setSelectedClass(null);
      setSelectedSubject(null);
    } else if (targetStep === 2 && selectedClass) {
      setActiveStep(2);
      setSelectedSubject(null);
    } else if (targetStep === 3 && selectedClass && selectedSubject) {
      setActiveStep(3);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in">
      {/* 1. TOP HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Curriculum & Academic Structure</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Manage Subjects & Hierarchy 📚
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              Configure Classes, Subjects, Syllabus Chapters, and Topics repository for exam paper generation.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition-all backdrop-blur-md border border-white/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/15">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200">
                Active Step
              </span>
              <h4 className="text-sm font-extrabold">
                {activeStep === 1
                  ? "1. Class Level"
                  : activeStep === 2
                  ? "2. Subjects"
                  : "3. Chapters & Topics"}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200">
                Total Subjects
              </span>
              <h4 className="text-sm font-extrabold">
                {loadingStats ? "..." : allSubjects.length} Configured
              </h4>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200">
                Selected Path
              </span>
              <h4 className="text-sm font-extrabold truncate">
                {selectedClass ? selectedClass.name : "All Grades"}
                {selectedSubject ? ` ➔ ${selectedSubject.subjectName}` : ""}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE STEPPER BREADCRUMBS */}
      <SubjectsBreadcrumbs
        activeStep={activeStep}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        onStepClick={handleStepClick}
      />

      {/* 3. STEP CONTENT SECTIONS */}
      {activeStep === 1 && (
        <ClassSection
          selectedClass={selectedClass}
          onSelect={handleClassSelect}
          allSubjects={allSubjects}
          onRefreshGlobal={fetchGlobalData}
        />
      )}

      {activeStep === 2 && (
        <SubjectSection
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          onSelect={handleSubjectSelect}
          onBackToClass={() => handleStepClick(1)}
          onRefreshGlobal={fetchGlobalData}
        />
      )}

      {activeStep === 3 && (
        <ChapterSection
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          onBackToSubjects={() => handleStepClick(2)}
          onRefreshGlobal={fetchGlobalData}
        />
      )}
    </div>
  );
};

export default AdminSubjects;
