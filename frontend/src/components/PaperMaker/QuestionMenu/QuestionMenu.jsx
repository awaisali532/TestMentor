import React, { useState, useEffect, useMemo, useCallback } from "react";
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

  const getSafeID = useCallback((q) => {
    if (!q) return "";
    if (q.questionId)
      return typeof q.questionId === "object"
        ? String(q.questionId._id)
        : String(q.questionId);
    return String(q._id);
  }, []);

  // ✅ 1. LOAD SAVED DATA ON OPEN
  useEffect(() => {
    if (isOpen && paperData && paperData.questions) {
      setTempSelected(paperData.questions);
    }
  }, [isOpen]);

  // ✅ 2. SYNC ON PATTERN CHANGE
  useEffect(() => {
    if (paperData && paperData.questions) {
      setTempSelected(paperData.questions);
    }
  }, [paperData.selectedPattern]);

  // ✅ 3. RESET ACTIVE SECTION
  useEffect(() => {
    if (!paperData || !paperData.selectedPattern) return;
    if (activeSection) {
      setActiveSection(null);
    }
  }, [paperData.selectedPattern]);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveSection(null);
  }, [activeTab]);

  // --- LOGIC ---

  const targetChapters = useMemo(() => {
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    if (!pattern?.sections) return null;
    let targetSection = null;

    if (activeTab === "MCQ") {
      targetSection = pattern.sections.find((s) => s.questionType === "MCQ");
    } else if (activeSection) {
      const parts = activeSection.split("_");
      const realIndex = parseInt(parts[1]);

      if (!isNaN(realIndex) && pattern.sections[realIndex]) {
        targetSection = pattern.sections[realIndex];
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
      const realIndex = parseInt(parts[1]);

      if (!isNaN(realIndex) && pattern.sections[realIndex]) {
        targetSection = pattern.sections[realIndex];
      }
    } else if (activeSection.startsWith("long_")) {
      const parts = activeSection.split("_");
      const secIndex = parseInt(parts[1]);

      if (!isNaN(secIndex) && pattern.sections[secIndex]) {
        targetSection = pattern.sections[secIndex];

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

  const getCurrentLimit = useCallback(() => {
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

    const parts = activeSection.split("_");
    const realIndex = parseInt(parts[1]);

    if (!isNaN(realIndex) && sections[realIndex]) {
      if (activeTab === "LONG") return 1;
      return parseInt(sections[realIndex].totalQuestions || 0);
    }

    return 0;
  }, [paperData, activeTab, activeSection]);

  // ✅ USE CALLBACK (Prevents child re-renders)
  const handleToggleSelect = useCallback(
    (clickedQuestion) => {
      const targetID = String(clickedQuestion._id);

      setTempSelected((prev) => {
        const isAlreadySelected = prev.some((q) => getSafeID(q) === targetID);

        if (isAlreadySelected) {
          return prev.filter((q) => getSafeID(q) !== targetID);
        }

        // We need to calculate limit inside setState or using current state logic
        // But getCurrentLimit depends on Props.
        // NOTE: For best performance, simpler logic here is better.
        const limit = getCurrentLimit();

        let currentCount = 0;
        let sectionIdToSave = null;

        if (activeTab === "MCQ") {
          currentCount = prev.filter((q) => q.type === "MCQ").length;
          sectionIdToSave = "MCQ";
        } else {
          if (!activeSection) {
            // This alert triggers inside render flow, ideally should be a UI flag
            // Using a small timeout to avoid setstate clash if needed
            setTimeout(
              () =>
                setAlertMsg(
                  "Please select a Question Number (Q.2, Q.3) first!",
                ),
              0,
            );
            return prev;
          }
          currentCount = prev.filter((q) => q.tabId === activeSection).length;
          sectionIdToSave = activeSection;
        }

        if (limit > 0 && currentCount >= limit) {
          setTimeout(
            () =>
              setAlertMsg(
                `Limit Reached! (${currentCount}/${limit}) selected.`,
              ),
            0,
          );
          return prev;
        }

        return [...prev, { ...clickedQuestion, tabId: sectionIdToSave }];
      });
    },
    [activeTab, activeSection, getCurrentLimit, getSafeID],
  ); // Dependencies

  const handleAutoSelect = useCallback(() => {
    if (availablePool.length === 0) {
      setAlertMsg("No questions available to auto-select!");
      return;
    }
    const limit = getCurrentLimit();

    // Logic needs tempSelected access.
    // Since we are in callback, we should trust the current state during execution
    // But generating auto selection needs the WHOLE array.
    // So we use tempSelected as dependency.
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

    if (activeTab === "LONG" && activeSection && activeSection.includes("_")) {
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
  }, [availablePool, activeTab, activeSection, tempSelected, getCurrentLimit]);

  const handleConfirmAdd = () => {
    if (onAddQuestionsToPaper) {
      onAddQuestionsToPaper(tempSelected, "REPLACE_ALL");
    }
  };

  // ✅ TYPE COUNTS
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

    if (tempSelected && tempSelected.length >= 0) {
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

  const questionsForFooter = useMemo(() => {
    if (activeTab === "MCQ") {
      return tempSelected.filter((q) => q.type === "MCQ");
    }
    if (activeSection) {
      return tempSelected.filter((q) => q.tabId === activeSection);
    }
    return [];
  }, [tempSelected, activeTab, activeSection]);

  const isSelectionChanged = useMemo(() => {
    const originalIDs = (selectedQuestions || [])
      .map((q) => getSafeID(q))
      .sort();
    const currentIDs = tempSelected.map((q) => getSafeID(q)).sort();
    return JSON.stringify(originalIDs) !== JSON.stringify(currentIDs);
  }, [tempSelected, selectedQuestions, getSafeID]);

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
            selectedQuestions={questionsForFooter}
            onRemove={handleToggleSelect}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuestionMenu);
