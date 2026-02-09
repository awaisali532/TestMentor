import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaExclamationCircle } from "react-icons/fa";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import TypeTabs from "./components/TypeTabs/TypeTabs";
import QuestionList from "./components/QuestionList/QuestionList";
import MenuFooter from "./components/MenuFooter/MenuFooter";
import "./QuestionMenu.css";

// Imports
import { getCategoriesForSubject } from "../../../config/SubjectConfig";
import { generateAutoSelection } from "../../../utils/AutoPaperGenerator";

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

  // Pool Store
  const [availablePool, setAvailablePool] = useState([]);

  useEffect(() => {
    if (paperData && paperData.subject) {
      const subjectName = paperData.subject.subjectName || paperData.subject;
      const cats = getCategoriesForSubject(subjectName);
      setCategoriesList(cats);
    }
  }, [paperData]);

  const getSafeID = (q) => {
    if (!q) return "";
    if (q.questionId)
      return typeof q.questionId === "object"
        ? String(q.questionId._id)
        : String(q.questionId);
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

  // --- CHAPTER & CATEGORY LOGIC ---
  const targetChapters = useMemo(() => {
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    if (!pattern?.sections) return null;
    let targetSection = null;
    if (activeTab === "MCQ") {
      targetSection = pattern.sections.find((s) => s.questionType === "MCQ");
    } else if (activeSection) {
      const parts = activeSection.split("_");
      let visualIndex = -1;
      if (activeSection.startsWith("sec_")) visualIndex = parseInt(parts[1]);
      else if (activeSection.startsWith("long_"))
        visualIndex = parseInt(parts[1]);
      if (visualIndex !== -1 && !isNaN(visualIndex)) {
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

  const targetCategory = useMemo(() => {
    if (!activeSection) return null;
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    if (!pattern?.sections) return null;
    let targetSection = null;
    if (activeSection.startsWith("sec_")) {
      const parts = activeSection.split("_");
      const visualIndex = parseInt(parts[1]);
      const relevantSections = pattern.sections.filter(
        (s) => s.questionType === activeTab,
      );
      targetSection = relevantSections[visualIndex];
    } else if (activeSection.startsWith("long_")) {
      const parts = activeSection.split("_");
      const secIndex = parseInt(parts[1]);
      const relevantSections = pattern.sections.filter(
        (s) => s.questionType === "LONG",
      );
      targetSection = relevantSections[secIndex];
      const partType = parts[3];
      if (
        targetSection &&
        targetSection.hasParts &&
        (partType === "a" || partType === "b")
      ) {
        const subIndex = partType === "a" ? 0 : 1;
        const subQ = targetSection.subQuestions?.[subIndex];
        if (subQ && subQ.questionCategory && subQ.questionCategory !== "ANY")
          return subQ.questionCategory;
      }
    }
    if (
      targetSection &&
      targetSection.questionCategory &&
      targetSection.questionCategory !== "ANY"
    ) {
      return targetSection.questionCategory;
    }
    return null;
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
    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab,
    );
    const parts = activeSection.split("_");
    const visualIndex = parseInt(parts[1]);
    if (relevantSections[visualIndex]) {
      if (activeTab === "LONG") return 1;
      return parseInt(relevantSections[visualIndex].totalQuestions || 0);
    }
    return 0;
  };

  // ✅ Toggle Logic (Adds to tempSelected)
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

  // ✅ Auto Select Logic
  const handleAutoSelect = () => {
    if (availablePool.length === 0) {
      setAlertMsg("No questions available to auto-select!");
      return;
    }
    const limit = getCurrentLimit();
    const currentCount =
      activeTab === "MCQ"
        ? tempSelected.filter((q) => q.type === "MCQ").length
        : tempSelected.filter((q) => q.tabId === activeSection).length;

    const needed = limit - currentCount;
    if (needed <= 0) {
      setAlertMsg("Section is already full!");
      return;
    }

    let options = { avoidChapters: [], targetDifficulty: null };

    if (activeTab === "LONG" && activeSection.includes("_")) {
      const parts = activeSection.split("_");
      const partType = parts[3];
      if (partType === "b") {
        const partA_ID = activeSection.replace("_b", "_a");
        const questionA = tempSelected.find((q) => q.tabId === partA_ID);
        if (questionA) {
          const chapA = questionA.chapter?._id || questionA.chapter;
          if (chapA) options.avoidChapters.push(chapA);
          if (questionA.difficulty === "Hard")
            options.targetDifficulty = "Medium";
          else if (questionA.difficulty === "Easy")
            options.targetDifficulty = "Medium";
          else options.targetDifficulty = "Hard";
        }
      }
    }

    const existingIds = tempSelected.map((q) => q._id);
    const newSelection = generateAutoSelection(
      availablePool,
      needed,
      existingIds,
      options,
    );

    if (newSelection.length === 0) {
      setAlertMsg("Could not find suitable questions.");
      return;
    }

    const formattedSelection = newSelection.map((q) => ({
      ...q,
      tabId: activeSection || "MCQ",
    }));

    setTempSelected((prev) => [...prev, ...formattedSelection]);
  };

  // ✅ FIX 1: Send ALL questions, not just activeTab
  const handleConfirmAdd = () => {
    if (onAddQuestionsToPaper) {
      // "REPLACE_ALL" tells parent to use this full list
      onAddQuestionsToPaper(tempSelected, "REPLACE_ALL");
    }
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

  // ✅ FIX 2: Filter Footer Selections based on Active Section
  const questionsForFooter = useMemo(() => {
    if (activeTab === "MCQ") {
      return tempSelected.filter((q) => q.type === "MCQ");
    }
    if (activeSection) {
      return tempSelected.filter((q) => q.tabId === activeSection);
    }
    return []; // Don't show entire short section mixed
  }, [tempSelected, activeTab, activeSection]);

  const isSelectionChanged = useMemo(() => {
    const originalIDs = (selectedQuestions || [])
      .map((q) => getSafeID(q))
      .sort();
    const currentIDs = tempSelected.map((q) => getSafeID(q)).sort();
    return JSON.stringify(originalIDs) !== JSON.stringify(currentIDs);
  }, [tempSelected, selectedQuestions]);

  if (!show) return null;

  return (
    <div
      className={`qm-overlay ${isOpen ? "open" : ""} ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
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
              requiredCategory={targetCategory}
              onDataLoaded={(data) => setAvailablePool(data)}
            />
          </div>

          {/* ✅ FOOTER SHOWS ONLY ACTIVE SECTION ITEMS */}
          <MenuFooter
            count={questionsForFooter.length}
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
            selectedQuestions={questionsForFooter} // Pass filtered list
            onRemove={handleToggleSelect}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionMenu;
