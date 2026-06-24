import React, { useState } from "react";
import "./ManageSubjects.css";
import ClassSection from "./ClassSection/ClassSection";
import SubjectSection from "./SubjectSection/SubjectSection";
import ChapterSection from "./ChapterSection/ChapterSection";

// ✅ Import Custom Modal (No Swal anymore)
import ConfirmationModal from "../../../components/common/ConfirmationModal/ConfirmationModal";

const ManageSubjects = () => {
  // --- MASTER STATE ---
  const [activeStep, setActiveStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // --- MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [pendingAction, setPendingAction] = useState(null); // Store the action to run after confirm

  // --- NAVIGATION CONTROLLER ---
  const safeNavigation = (actionCallback) => {
    if (isEditing) {
      // Agar editing ho rahi hai, to action ko store karein aur Modal kholien
      setPendingAction(() => actionCallback);
      setConfirmModal({
        isOpen: true,
        title: "Unsaved Changes!",
        message:
          "You are editing data. Do you want to discard changes and leave?",
      });
    } else {
      // Agar editing nahi ho rahi, direct action chalayen
      actionCallback();
    }
  };

  // --- HANDLE MODAL CONFIRM ---
  const handleConfirmNavigation = () => {
    setIsEditing(false); // Reset editing state
    setConfirmModal({ ...confirmModal, isOpen: false }); // Close modal
    if (pendingAction) {
      pendingAction(); // Run the stored action (e.g., change step)
    }
    setPendingAction(null);
  };

  // --- HANDLERS ---
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
      {/* ✅ Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmNavigation}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Yes, Leave"
        cancelText="No, Stay"
        isDanger={true}
      />

      <h3 className="fw-bold text-main mb-4">Subject Management</h3>

      <div className="accordion-container">
        {/* --- STEP 1: CLASSES --- */}
        <ClassSection
          isExpanded={activeStep === 1}
          selectedClass={selectedClass}
          onSelect={handleClassSelect}
          onHeaderClick={() => handleHeaderClick(1)}
          setIsEditing={setIsEditing} // Pass setter to child
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
