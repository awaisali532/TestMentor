import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import TypeTabs from "./components/TypeTabs/TypeTabs";
import QuestionList from "./components/QuestionList/QuestionList";
import MenuFooter from "./components/MenuFooter/MenuFooter";
import "./QuestionMenu.css";

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
  const [tempSelected, setTempSelected] = useState([]);

  // --- ANIMATION ---
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- RESET ON TAB CHANGE ---
  useEffect(() => {
    setActiveSection(null);
    setTempSelected([]);
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
        } else {
          setCategoriesList(res.data.categories || []);
          setDifficultiesList(res.data.difficulties || []);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchFilters();
  }, [isOpen]);

  // --- TOGGLE SELECTION ---
  const handleToggleSelect = (question) => {
    setTempSelected((prev) => {
      const exists = prev.find((q) => q._id === question._id);
      if (exists) return prev.filter((q) => q._id !== question._id);
      return [...prev, question];
    });
  };

  const handleConfirmAdd = () => {
    if (onAddQuestionsToPaper) {
      onAddQuestionsToPaper(tempSelected, activeSection);
    }
    setTempSelected([]);
  };

  const handleAutoSelect = () => {
    alert("Auto Select Logic Coming Soon!");
  };

  // --- ✅ FIXED: PAPER LIMITS CALCULATION ---
  const typeCounts = useMemo(() => {
    const counts = {
      MCQ: { total: 0, current: 0 },
      SHORT: { total: 0, current: 0 },
      LONG: { total: 0, current: 0 },
    };

    if (!paperData) return counts;

    // ✅ FIX: Check both locations (Wizard data might vary)
    const pattern = paperData.paperPattern || paperData.selectedPattern || {};

    // 1. MCQs Total
    // Check various casing: mcqs, MCQ, objective
    const mcqData = pattern.mcqs || pattern.MCQ || pattern.objective;
    if (mcqData) {
      counts.MCQ.total = parseInt(
        mcqData.quantity || mcqData.totalQuestions || 0
      );
    }

    // 2. Short Questions Total
    const shortData = pattern.shortQuestions || pattern.SHORT || pattern.short;
    if (shortData) {
      if (Array.isArray(shortData)) {
        // Sum up all sections
        counts.SHORT.total = shortData.reduce(
          (sum, sec) =>
            sum + (parseInt(sec.quantity || sec.totalQuestions) || 0),
          0
        );
      } else {
        counts.SHORT.total = parseInt(
          shortData.quantity || shortData.totalQuestions || 0
        );
      }
    }

    // 3. Long Questions Total
    const longData = pattern.longQuestions || pattern.LONG || pattern.long;
    if (longData) {
      if (Array.isArray(longData)) {
        counts.LONG.total = longData.reduce(
          (sum, sec) =>
            sum + (parseInt(sec.quantity || sec.totalQuestions) || 0),
          0
        );
      } else {
        counts.LONG.total = parseInt(
          longData.quantity || longData.totalQuestions || 0
        );
      }
    }

    // 4. Current Selected
    if (selectedQuestions && selectedQuestions.length > 0) {
      counts.MCQ.current = selectedQuestions.filter(
        (q) => q.type === "MCQ"
      ).length;
      counts.SHORT.current = selectedQuestions.filter(
        (q) => q.type === "SHORT"
      ).length;
      counts.LONG.current = selectedQuestions.filter(
        (q) => q.type === "LONG"
      ).length;
    }

    return counts;
  }, [paperData, selectedQuestions]);

  if (!show) return null;

  return (
    <div
      className={`qm-overlay ${isOpen ? "open" : ""} ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
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
              typeCounts={typeCounts} // ✅ Correct Counts passed
              paperData={paperData}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              selectedQuestions={selectedQuestions}
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
            count={tempSelected.length}
            sectionLabel={
              activeSection
                ? activeSection.replace(/_/g, " ").toUpperCase()
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
