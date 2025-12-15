import React, { useState } from "react";
import "./ManageSubjects.css";
import ClassSection from "./ClassSection/ClassSection";
import SubjectSection from "./SubjectSection/SubjectSection";
import ChapterSection from "./ChapterSection/ChapterSection";
import Swal from "sweetalert2";

const ManageSubjects = () => {
  // --- MASTER STATE ---
  const [activeStep, setActiveStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // --- NAVIGATION CONTROLLER ---
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
        background: "var(--card-bg)",
        color: "var(--text-main)",
      });
      if (!result.isConfirmed) return;
      setIsEditing(false);
    }
    actionCallback();
  };

  const handleClassSelect = (cls) => {
    safeNavigation(() => {
      setSelectedClass(cls);
      setActiveStep(2);
    });
  };

  const handleSubjectSelect = (sub) => {
    safeNavigation(() => {
      setSelectedSubject(sub);
      setActiveStep(3);
    });
  };

  const handleHeaderClick = (targetStep) => {
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
    <div className="admin-wrapper p-4">
      <h3 className="fw-bold text-main mb-4">Subject Management</h3>

      <div className="accordion-container">
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
