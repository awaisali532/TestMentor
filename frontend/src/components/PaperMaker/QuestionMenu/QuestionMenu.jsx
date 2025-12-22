import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaExclamationCircle } from "react-icons/fa";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import TypeTabs from "./components/TypeTabs/TypeTabs";
import QuestionList from "./components/QuestionList/QuestionList";
import MenuFooter from "./components/MenuFooter/MenuFooter"; // ✅ Updated Footer Import
import "./QuestionMenu.css";

// CUSTOM ALERT COMPONENT
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
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATE ---
  const [categoriesList, setCategoriesList] = useState([]);
  const [difficultiesList, setDifficultiesList] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [activeTab, setActiveTab] = useState("MCQ");
  const [activeSection, setActiveSection] = useState(null);
  const [filters, setFilters] = useState({ category: [], difficulty: [] });
  const [show, setShow] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [tempSelected, setTempSelected] = useState([]);

  // --- INIT ---
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedQuestions || []);
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- RESET SECTION ---
  useEffect(() => {
    setActiveSection(null);
  }, [activeTab]);

  // --- FETCH FILTERS ---
  useEffect(() => {
    if (!isOpen) return;
    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/questions/filters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCategoriesList(res.data.categories);
          setDifficultiesList(res.data.difficulties);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchFilters();
  }, [isOpen]);

  // ============================================================
  // ✅ HELPER: GET CURRENT SECTION LIMIT (For Footer & Logic)
  // ============================================================
  const getCurrentLimit = () => {
    const pattern = paperData.selectedPattern || paperData.paperPattern;
    const sections = pattern?.sections || [];
    if (sections.length === 0) return 0;

    if (activeTab === "MCQ") {
      const mcqSection = sections.find((s) => s.questionType === "MCQ");
      if (mcqSection)
        return parseInt(mcqSection.totalQuestions || mcqSection.quantity || 0);
      // Fallback
      const oldMcq = pattern.mcqs || pattern.objective;
      return parseInt(oldMcq?.quantity || 0);
    }

    if (!activeSection) return 0; // No section selected

    // Extract index from ID (sec_0 -> 0)
    const parts = activeSection.split("_");
    const secIndex = parseInt(parts[1]);
    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab
    );

    if (relevantSections[secIndex]) {
      if (activeTab === "LONG") return 1; // Long Q parts are 1 per slot
      return parseInt(relevantSections[secIndex].totalQuestions || 0);
    }

    return 0;
  };

  // ============================================================
  // LIMIT CHECKING LOGIC
  // ============================================================
  const handleToggleSelect = (question) => {
    // 1. DESELECT
    const isAlreadySelected = tempSelected.some((q) => q._id === question._id);
    if (isAlreadySelected) {
      setTempSelected((prev) => prev.filter((q) => q._id !== question._id));
      return;
    }

    // 2. CHECK LIMIT
    const limit = getCurrentLimit(); // Reuse helper
    let currentCount = 0;
    let sectionIdToSave = null;

    if (activeTab === "MCQ") {
      currentCount = tempSelected.filter((q) => q.type === "MCQ").length;
      sectionIdToSave = "MCQ";
    } else {
      if (!activeSection) {
        setAlertMsg("Please select a Question Number (e.g., Q.2) first!");
        return;
      }
      currentCount = tempSelected.filter(
        (q) => q.tabId === activeSection
      ).length;
      sectionIdToSave = activeSection;
    }

    if (limit > 0 && currentCount >= limit) {
      setAlertMsg(`Limit Reached! (${currentCount}/${limit}) selected.`);
      return;
    }

    // ✅ ADD
    setTempSelected((prev) => [
      ...prev,
      { ...question, tabId: sectionIdToSave },
    ]);
  };

  const handleConfirmAdd = () => {
    if (onAddQuestionsToPaper) {
      onAddQuestionsToPaper(tempSelected);
    }
  };

  const handleAutoSelect = () => {
    alert("Auto Select Coming Soon!");
  };

  // --- COUNTS FOR TABS ---
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
        (q) => q.type === "SHORT"
      ).length;
      counts.LONG.current = tempSelected.filter(
        (q) => q.type === "LONG"
      ).length;
    }
    return counts;
  }, [paperData, tempSelected]);

  // ✅ Calculate current count for Footer
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

          {/* Content Area with Padding Fix */}
          <div className="qm-content">
            <QuestionList
              filters={filters}
              activeTab={activeTab}
              paperData={paperData}
              tempSelected={tempSelected}
              onToggleSelect={handleToggleSelect}
            />
          </div>

          {/* ✅ Footer with Dynamic Limit & Count */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionMenu;
