import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaExclamationCircle } from "react-icons/fa";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import TypeTabs from "./components/TypeTabs/TypeTabs";
import QuestionList from "./components/QuestionList/QuestionList";
import MenuFooter from "./components/MenuFooter/MenuFooter";
import "./QuestionMenu.css";

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

  const [categoriesList, setCategoriesList] = useState([]);
  const [difficultiesList, setDifficultiesList] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [activeTab, setActiveTab] = useState("MCQ");
  const [activeSection, setActiveSection] = useState(null);
  const [filters, setFilters] = useState({ category: [], difficulty: [] });
  const [show, setShow] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [tempSelected, setTempSelected] = useState([]);

  // ✅ MAGIC HELPER (Ye ID ko String banata hai taake Comparison sahi ho)
  const getSafeID = (q) => {
    if (!q) return "";

    // Priority 1: Agar Saved Question hai
    if (q.questionId) {
      return typeof q.questionId === "object"
        ? String(q.questionId._id)
        : String(q.questionId);
    }

    // Priority 2: Agar New Question hai
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
    const parts = activeSection.split("_");
    const secIndex = parseInt(parts[1]);
    const relevantSections = sections.filter(
      (s) => s.questionType === activeTab
    );

    if (relevantSections[secIndex]) {
      if (activeTab === "LONG") return 1;
      return parseInt(relevantSections[secIndex].totalQuestions || 0);
    }
    return 0;
  };

  // ============================================================
  // ✅ FIX: BULLETPROOF CHANGE DETECTION
  // ============================================================
  const isSelectionChanged = useMemo(() => {
    // 1. Parent se aaye hue questions ki IDs nikalo (Sirf Active Tab ki)
    const originalIDs = selectedQuestions
      .filter((q) => q.type === activeTab)
      .map((q) => getSafeID(q))
      .sort();

    // 2. Abhi Menu mein jo select kiye hain unki IDs nikalo (Sirf Active Tab ki)
    const currentIDs = tempSelected
      .filter((q) => q.type === activeTab)
      .map((q) => getSafeID(q))
      .sort();

    // 3. Compare karo
    // Agar length barabar nahi, matlb change hua hai
    if (originalIDs.length !== currentIDs.length) return true;

    // Agar length same hai, to check karo IDs same hain ya nahi
    // JSON.stringify arrays ko string bana kar compare karega ["1", "2"] vs ["1", "3"]
    return JSON.stringify(originalIDs) !== JSON.stringify(currentIDs);
  }, [tempSelected, selectedQuestions, activeTab]);

  const handleToggleSelect = (clickedQuestion) => {
    const targetID = String(clickedQuestion._id);

    // Check karo: Kya ye ID list mein hai? (Using Helper)
    const isAlreadySelected = tempSelected.some(
      (q) => getSafeID(q) === targetID
    );

    // UNSELECT LOGIC
    if (isAlreadySelected) {
      setTempSelected((prev) => prev.filter((q) => getSafeID(q) !== targetID));
      return;
    }

    // SELECT LOGIC
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
        (q) => q.tabId === activeSection
      ).length;
      sectionIdToSave = activeSection;
    }

    if (limit > 0 && currentCount >= limit) {
      setAlertMsg(`Limit Reached! (${currentCount}/${limit}) selected.`);
      return;
    }

    // Add to list
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
        (q) => q.type === "SHORT"
      ).length;
      counts.LONG.current = tempSelected.filter(
        (q) => q.type === "LONG"
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
            isChanged={isSelectionChanged} // ✅ Ab ye sahi True/False bhejega
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionMenu;
