import React, { useState, useEffect } from "react";
import axios from "axios";
import MenuHeader from "./components/MenuHeader/MenuHeader";
import MenuFilters from "./components/MenuFilters/MenuFilters";
import TypeTabs from "./components/TypeTabs/TypeTabs";
import QuestionList from "./components/QuestionList/QuestionList";
import "./QuestionMenu.css";

const QuestionMenu = ({
  isOpen,
  onClose,
  paperData,
  isSidebarCollapsed,
  onEditPattern,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATE ---
  const [categoriesList, setCategoriesList] = useState([]);
  const [difficultiesList, setDifficultiesList] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [activeTab, setActiveTab] = useState("MCQ");

  const [filters, setFilters] = useState({
    category: [],
    difficulty: [],
  });

  const [show, setShow] = useState(false);

  // ✅ FETCH FILTERS FROM BACKEND
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoadingFilters(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/api/questions/filters`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedCats = res.data.categories || [];
        const fetchedDiffs = res.data.difficulties || [];

        setCategoriesList(fetchedCats);
        setDifficultiesList(fetchedDiffs);

        // ✅ Default Select All
        setFilters((prev) => ({
          ...prev,
          category: fetchedCats,
          difficulty: fetchedDiffs,
        }));
      } catch (err) {
        console.error("Failed to fetch filters:", err);
        // Fallback
        const fallbackCats = ["TEXT", "EXERCISE", "PAST_PAPER"];
        const fallbackDiffs = ["Easy", "Medium", "Hard"];

        setCategoriesList(fallbackCats);
        setDifficultiesList(fallbackDiffs);

        setFilters((prev) => ({
          ...prev,
          category: fallbackCats,
          difficulty: fallbackDiffs,
        }));
      } finally {
        setLoadingFilters(false);
      }
    };

    if (isOpen) {
      fetchFilters();
      setShow(true);
    } else {
      setTimeout(() => setShow(false), 300);
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

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
            {/* ✅ Pass Dynamic Lists to Filters */}
            <MenuFilters
              filters={filters}
              setFilters={setFilters}
              categoriesList={categoriesList}
              difficultiesList={difficultiesList}
              loading={loadingFilters}
            />

            <TypeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="qm-content">
            <QuestionList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionMenu;
