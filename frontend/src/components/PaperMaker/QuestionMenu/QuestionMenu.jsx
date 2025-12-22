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

  // --- STATE MANAGEMENT ---
  const [categoriesList, setCategoriesList] = useState([]);
  const [difficultiesList, setDifficultiesList] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [activeTab, setActiveTab] = useState("MCQ");
  const [activeSection, setActiveSection] = useState(null);

  const [filters, setFilters] = useState({ category: [], difficulty: [] });

  // Animation State
  const [show, setShow] = useState(false);

  // ✅ TEMP SELECTION STATE (Currently selected in this menu session)
  const [tempSelected, setTempSelected] = useState([]);

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- RESET SELECTION ON TAB CHANGE ---
  // Safety: Don't mix MCQ selections with Short Question selections
  useEffect(() => {
    setActiveSection(null);
    setTempSelected([]);
  }, [activeTab]);

  // --- FETCH FILTERS (The Fix) ---
  useEffect(() => {
    // Only fetch if menu is open
    if (!isOpen) return;

    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const token = localStorage.getItem("token"); // ✅ Get Token

        const res = await axios.get(`${BASE_URL}/api/questions/filters`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Send Token
          },
        });

        // ✅ Handle New Response Structure
        if (res.data.success) {
          setCategoriesList(res.data.categories);
          setDifficultiesList(res.data.difficulties);
        } else {
          // Fallback
          setCategoriesList(res.data.categories || []);
          setDifficultiesList(res.data.difficulties || []);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      } finally {
        setLoadingFilters(false); // ✅ Stop Loading
      }
    };

    fetchFilters();
  }, [isOpen]);

  // --- TOGGLE SELECTION LOGIC ---
  const handleToggleSelect = (question) => {
    setTempSelected((prev) => {
      const exists = prev.find((q) => q._id === question._id);
      if (exists) {
        // Remove if exists
        return prev.filter((q) => q._id !== question._id);
      }
      // Add if new
      return [...prev, question];
    });
  };

  // --- CONFIRM ADD TO PAPER ---
  const handleConfirmAdd = () => {
    if (onAddQuestionsToPaper) {
      // Send selected questions + target section to Parent
      onAddQuestionsToPaper(tempSelected, activeSection);
    }
    setTempSelected([]); // Clear temp after adding
    // onClose(); // Uncomment if you want to close menu automatically
  };

  // --- AUTO SELECT LOGIC (Placeholder) ---
  const handleAutoSelect = () => {
    alert("Auto Select Logic Coming Soon!");
  };

  // --- PAPER LIMITS CALCULATION ---
  // Calculates how many questions are allowed vs selected
  const typeCounts = useMemo(() => {
    if (!paperData || !paperData.paperPattern) {
      return {
        MCQ: { total: 0, current: 0 },
        SHORT: { total: 0, current: 0 },
        LONG: { total: 0, current: 0 },
      };
    }

    // Helper to count selected questions by type
    const countCurrent = (type) =>
      selectedQuestions.filter((q) => q.type === type).length;

    // Helper to sum totals from Paper Pattern
    const countTotal = (typeKey) => {
      const section = paperData.paperPattern[typeKey];
      if (!section) return 0;
      // If array of sections (like Short Questions), sum them up
      if (Array.isArray(section)) {
        return section.reduce(
          (sum, item) => sum + (parseInt(item.quantity) || 0),
          0
        );
      }
      // If single object (like MCQs)
      return parseInt(section.quantity) || 0;
    };

    return {
      MCQ: {
        total: countTotal("mcqs"),
        current: countCurrent("MCQ"),
      },
      SHORT: {
        total: countTotal("shortQuestions"),
        current: countCurrent("SHORT"),
      },
      LONG: {
        total: countTotal("longQuestions"),
        current: countCurrent("LONG"),
      },
    };
  }, [paperData, selectedQuestions]);

  // --- RENDER ---
  if (!show) return null;

  return (
    <div
      className={`qm-overlay ${isOpen ? "open" : ""} ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <div className="qm-container">
        {/* HEADER */}
        <MenuHeader
          paperData={paperData}
          onClose={onClose}
          onEditPreset={onEditPattern}
        />

        <div className="qm-body">
          {/* CONTROLS (Filters + Tabs) */}
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
              selectedQuestions={selectedQuestions}
            />
          </div>

          {/* LIST CONTENT */}
          <div className="qm-content">
            <QuestionList
              filters={filters}
              activeTab={activeTab}
              paperData={paperData}
              tempSelected={tempSelected}
              onToggleSelect={handleToggleSelect}
            />
          </div>

          {/* STICKY FOOTER */}
          <MenuFooter
            count={tempSelected.length}
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
