import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaExclamationCircle } from "react-icons/fa";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import TypeTabs from "./components/TypeTabs/TypeTabs";
import QuestionList from "./components/QuestionList/QuestionList";
import MenuFooter from "./components/MenuFooter/MenuFooter";
import "./QuestionMenu.css";

import { getCategoriesForSubject } from "../../../config/SubjectConfig";

const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="qm-alert-overlay">
      <div className="qm-alert-box">
        <div className="qm-alert-icon">
          <FaExclamationCircle />
        </div>
        <div className="qm-alert-msg">{message}</div>
        <button className="qm-alert-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

const QuestionMenu = ({
  isOpen,
  onClose,
  paperData,
  isSidebarCollapsed,
  onEditPattern,
  selectedQuestions = [],
  onAddQuestionsToPaper,
}) => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [difficultiesList] = useState(["Easy", "Medium", "Hard"]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const [activeTab, setActiveTab] = useState("MCQ");
  const [activeSection, setActiveSection] = useState(null);
  const [filters, setFilters] = useState({ category: [], difficulty: [] });
  const [show, setShow] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    if (paperData && paperData.subject) {
      const cats = getCategoriesForSubject(paperData.subject);
      setCategoriesList(cats);
    }
  }, [paperData]);

  const getSafeID = (q) => {
    if (!q) return "";
    if (q.questionId) {
      return typeof q.questionId === "object"
        ? String(q.questionId._id)
        : String(q.questionId);
    }
    return String(q._id);
  };

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedQuestions || []);
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedQuestions]);

  useEffect(() => {
    setActiveSection(null);
  }, [activeTab]);

  // ============================================================
  // 1. 🔥 PAIRING EXTRACTION (Chapters)
  // ============================================================
  const targetChapters = useMemo(() => {
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    if (!pattern?.sections) return null;

    let targetSection = null;

    if (activeTab === "MCQ") {
      targetSection = pattern.sections.find((s) => s.questionType === "MCQ");
    } else if (activeSection) {
      const parts = activeSection.split("_");
      let visualIndex = -1;

      // Extract index based on Tab Type
      if (activeSection.startsWith("sec_")) {
        // Shorts
        visualIndex = parseInt(parts[1]);
      } else if (activeSection.startsWith("long_")) {
        // Longs
        visualIndex = parseInt(parts[1]);
      }

      if (visualIndex !== -1 && !isNaN(visualIndex)) {
        // Filter sections by Active Tab first to match visual order
        const relevantSections = pattern.sections.filter(
          (s) => s.questionType === activeTab,
        );
        targetSection = relevantSections[visualIndex];
      }
    }

    if (
      targetSection &&
      targetSection.linkedChapters &&
      targetSection.linkedChapters.length > 0
    ) {
      return targetSection.linkedChapters;
    }
    return null;
  }, [activeTab, activeSection, paperData]);

  // ============================================================
  // 2. 🔥 CATEGORY EXTRACTION (Universal: Short & Long)
  // ============================================================
  const targetCategory = useMemo(() => {
    if (!activeSection) return null;

    const pattern = paperData.selectedPattern || paperData.paperPattern;
    if (!pattern?.sections) return null;

    let targetSection = null;

    // 1. Identify Section (Short or Long)
    if (activeSection.startsWith("sec_")) {
      // SHORT QUESTIONS Logic
      const parts = activeSection.split("_");
      const visualIndex = parseInt(parts[1]);
      const relevantSections = pattern.sections.filter(
        (s) => s.questionType === activeTab,
      );
      targetSection = relevantSections[visualIndex];
    } else if (activeSection.startsWith("long_")) {
      // LONG QUESTIONS Logic
      const parts = activeSection.split("_");
      const secIndex = parseInt(parts[1]);
      const relevantSections = pattern.sections.filter(
        (s) => s.questionType === "LONG",
      );
      targetSection = relevantSections[secIndex];

      // Handle Parts (a/b)
      const partType = parts[3]; // "a", "b", "full"
      if (
        targetSection &&
        targetSection.hasParts &&
        (partType === "a" || partType === "b")
      ) {
        const subIndex = partType === "a" ? 0 : 1;
        const subQ = targetSection.subQuestions?.[subIndex];
        if (subQ && subQ.questionCategory && subQ.questionCategory !== "ANY") {
          return subQ.questionCategory;
        }
      }
    }

    // 2. Default Check (For Short Sections OR Full Long Questions)
    if (
      targetSection &&
      targetSection.questionCategory &&
      targetSection.questionCategory !== "ANY"
    ) {
      console.log(
        `🎯 Strict Category found for ${activeTab}:`,
        targetSection.questionCategory,
      );
      return targetSection.questionCategory;
    }

    return null; // "ANY" means show everything
  }, [activeTab, activeSection, paperData]);

  const getCurrentLimit = () => {
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    const sections = pattern?.sections || [];
    if (sections.length === 0) return 0;

    if (activeTab === "MCQ") {
      const mcqSection = sections.find((s) => s.questionType === "MCQ");
      if (mcqSection)
        return parseInt(mcqSection.totalQuestions || mcqSection.quantity || 0);
      return 0;
    }

    if (!activeSection) return 0;

    // Correct visual index mapping for limit
    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab,
    );
    const parts = activeSection.split("_");
    const visualIndex = parseInt(parts[1]); // sec_X or long_X

    if (relevantSections[visualIndex]) {
      if (activeTab === "LONG") return 1;
      return parseInt(relevantSections[visualIndex].totalQuestions || 0);
    }
    return 0;
  };

  const isSelectionChanged = useMemo(() => {
    const originalIDs = selectedQuestions
      .filter((q) => q.type === activeTab)
      .map((q) => getSafeID(q))
      .sort();

    const currentIDs = tempSelected
      .filter((q) => q.type === activeTab)
      .map((q) => getSafeID(q))
      .sort();

    if (originalIDs.length !== currentIDs.length) return true;
    return JSON.stringify(originalIDs) !== JSON.stringify(currentIDs);
  }, [tempSelected, selectedQuestions, activeTab]);

  const handleToggleSelect = (clickedQuestion) => {
    const targetID = String(clickedQuestion._id);
    const isAlreadySelected = tempSelected.some(
      (q) => getSafeID(q) === targetID,
    );

    if (isAlreadySelected) {
      setTempSelected((prev) => prev.filter((q) => getSafeID(q) !== targetID));
      return;
    }

    const limit = getCurrentLimit();
    let currentCount = 0;
    let sectionIdToSave = null;

    if (activeTab === "MCQ") {
      currentCount = tempSelected.filter((q) => q.type === "MCQ").length;
      sectionIdToSave = "MCQ";
    } else {
      if (!activeSection) {
        setAlertMsg("Please select a Question Number (Q.2, Q.3) first!");
        return;
      }
      currentCount = tempSelected.filter(
        (q) => q.tabId === activeSection,
      ).length;
      sectionIdToSave = activeSection;
    }

    if (limit > 0 && currentCount >= limit) {
      setAlertMsg(`Limit Reached! (${currentCount}/${limit}) selected.`);
      return;
    }

    setTempSelected((prev) => [
      ...prev,
      { ...clickedQuestion, tabId: sectionIdToSave },
    ]);
  };

  const handleConfirmAdd = () => {
    if (onAddQuestionsToPaper) {
      const questionsToSend = tempSelected.filter((q) => q.type === activeTab);
      onAddQuestionsToPaper(questionsToSend, activeTab);
    }
  };

  const handleAutoSelect = () => {
    alert("Auto Select Coming Soon!");
  };

  const typeCounts = useMemo(() => {
    const counts = {
      MCQ: { total: 0, current: 0 },
      SHORT: { total: 0, current: 0 },
      LONG: { total: 0, current: 0 },
    };
    if (!paperData) return counts;
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    const sections = pattern?.sections || [];

    sections.forEach((sec) => {
      const type = sec.questionType;
      let qty = parseInt(sec.totalQuestions || sec.quantity) || 0;
      if (type === "LONG" && sec.hasParts) qty = qty * 2;
      if (counts[type]) counts[type].total += qty;
    });

    if (tempSelected.length > 0) {
      counts.MCQ.current = tempSelected.filter((q) => q.type === "MCQ").length;
      counts.SHORT.current = tempSelected.filter(
        (q) => q.type === "SHORT",
      ).length;
      counts.LONG.current = tempSelected.filter(
        (q) => q.type === "LONG",
      ).length;
    }
    return counts;
  }, [paperData, tempSelected]);

  const currentSelectionCount = useMemo(() => {
    if (activeTab === "MCQ")
      return tempSelected.filter((q) => q.type === "MCQ").length;
    if (!activeSection) return 0;
    return tempSelected.filter((q) => q.tabId === activeSection).length;
  }, [tempSelected, activeTab, activeSection]);

  if (!show) return null;

  return (
    <div
      className={`qm-overlay ${isOpen ? "open" : ""} ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <CustomAlert message={alertMsg} onClose={() => setAlertMsg(null)} />

      <div className="qm-container">
        <MenuHeader
          paperData={paperData}
          onClose={onClose}
          onEditPreset={onEditPattern}
        />

        <div className="qm-body">
          <div className="qm-controls">
            <MenuFilters
              filters={filters}
              setFilters={setFilters}
              categoriesList={categoriesList}
              difficultiesList={difficultiesList}
              loading={loadingFilters}
            />
            <TypeTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              typeCounts={typeCounts}
              paperData={paperData}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              selectedQuestions={tempSelected}
            />
          </div>

          <div className="qm-content">
            <QuestionList
              filters={filters}
              activeTab={activeTab}
              paperData={paperData}
              tempSelected={tempSelected}
              onToggleSelect={handleToggleSelect}
              requiredChapters={targetChapters}
              requiredCategory={targetCategory} // ✅ Passing calculated Category
            />
          </div>

          <MenuFooter
            count={currentSelectionCount}
            limit={getCurrentLimit()}
            sectionLabel={
              activeSection
                ? activeSection.replace(/_/g, " ").toUpperCase()
                : activeTab === "MCQ"
                  ? "MCQ SECTION"
                  : "SECTION"
            }
            onAdd={handleConfirmAdd}
            onAutoSelect={handleAutoSelect}
            isChanged={isSelectionChanged}
            selectedQuestions={tempSelected}
            onRemove={handleToggleSelect}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionMenu;
