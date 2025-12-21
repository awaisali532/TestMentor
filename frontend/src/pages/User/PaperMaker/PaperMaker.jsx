import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import MakerSidebar from "../../../components/PaperMaker/MakerSidebar/MakerSidebar";
import PaperPreview from "../../../components/PaperMaker/PaperPreview/PaperPreview";
import QuestionMenu from "../../../components/PaperMaker/QuestionMenu/QuestionMenu";
import PatternForm from "../../Admin/PaperPatterns/PatternForm"; // ✅ Import Pattern Form
import "./PaperMaker.css";

const PaperMaker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ✅ 1. State for Paper Data (Taake update ho sake)
  const [paperData, setPaperData] = useState(location.state);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ✅ 2. State for Edit Pattern Modal
  const [showPatternEdit, setShowPatternEdit] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate("/user/generate-paper");
    }
  }, [location.state, navigate]);

  if (!paperData) return null;

  // ✅ 3. Handler to Update Pattern
  const handlePatternUpdate = (updatedPattern) => {
    setPaperData((prev) => ({
      ...prev,
      selectedPattern: updatedPattern, // Naya pattern set kro
    }));
    setShowPatternEdit(false); // Modal band kro
  };

  return (
    <div
      className={`pm-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      <MakerSidebar
        paperData={paperData}
        onOpenMenu={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="pm-workspace">
        <PaperPreview paperData={paperData} />
      </div>

      <QuestionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        paperData={paperData}
        isSidebarCollapsed={isSidebarCollapsed}
        // ✅ Pass Trigger Function
        onEditPattern={() => setShowPatternEdit(true)}
      />

      {/* ✅ 4. RENDER PATTERN FORM MODAL */}
      {showPatternEdit && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-content">
            <PatternForm
              onClose={() => setShowPatternEdit(false)}
              initialData={paperData.selectedPattern} // Purana data bhejo
              isUserMode={true} // User mode on
              onSuccess={handlePatternUpdate} // Wapis data receive kro
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperMaker;
