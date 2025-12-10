import React, { useState } from "react";
import "./ManageSubjects.css";
import ClassSection from "./ClassSection";
import SubjectSection from "./SubjectSection";
import ChapterSection from "./ChapterSection";
import Swal from "sweetalert2";

const ManageSubjects = () => {
  // --- MASTER STATE ---
  const [activeStep, setActiveStep] = useState(1); // 1 = Class, 2 = Subject, 3 = Chapter
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // "Dirty" state: If true, user is typing/editing, so warn before leaving
  const [isEditing, setIsEditing] = useState(false);

  // --- NAVIGATION CONTROLLER ---

  // Helper: Checks for unsaved changes before moving
  const safeNavigation = async (actionCallback) => {
    if (isEditing) {
      const result = await Swal.fire({
        title: "Unsaved Changes!",
        text: "You are editing data. Do you want to discard changes and leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "No, Stay",
      });
      if (!result.isConfirmed) return; // Stop navigation
      setIsEditing(false); // Reset dirty state
    }
    actionCallback(); // Proceed with navigation
  };

  // 1. Move Forward to Subjects
  const handleClassSelect = (cls) => {
    safeNavigation(() => {
      setSelectedClass(cls);
      setActiveStep(2);
    });
  };

  // 2. Move Forward to Chapters
  const handleSubjectSelect = (sub) => {
    safeNavigation(() => {
      setSelectedSubject(sub);
      setActiveStep(3);
    });
  };

  // 3. Move Backward (Clicking Headers)
  const handleHeaderClick = (targetStep) => {
    // Only allow going back (e.g., clicking Step 1 when on Step 3)
    if (targetStep < activeStep) {
      safeNavigation(() => {
        setActiveStep(targetStep);
        if (targetStep === 1) {
          setSelectedClass(null);
          setSelectedSubject(null);
        } else if (targetStep === 2) {
          setSelectedSubject(null);
        }
      });
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="accordion-container">
        {/* HEADER */}
        <h3 className="fw-bold text-dark mb-4">Subject Management</h3>

        {/* --- STEP 1: CLASSES --- */}
        <ClassSection
          isExpanded={activeStep === 1}
          selectedClass={selectedClass}
          onSelect={handleClassSelect}
          onHeaderClick={() => handleHeaderClick(1)}
          setIsEditing={setIsEditing}
        />

        {/* --- STEP 2: SUBJECTS --- */}
        {activeStep >= 2 && (
          <SubjectSection
            isExpanded={activeStep === 2}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onSelect={handleSubjectSelect}
            onHeaderClick={() => handleHeaderClick(2)}
            setIsEditing={setIsEditing}
          />
        )}

        {/* --- STEP 3: CHAPTERS --- */}
        {activeStep >= 3 && (
          <ChapterSection
            isExpanded={activeStep === 3}
            selectedSubject={selectedSubject}
            onHeaderClick={() => handleHeaderClick(3)}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </div>
  );
};

export default ManageSubjects;
