import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import MakerSidebar from "../../../components/PaperMaker/MakerSidebar/MakerSidebar";
import PaperPreview from "../../../components/PaperMaker/PaperPreview/PaperPreview";
import QuestionMenu from "../../../components/PaperMaker/QuestionMenu/QuestionMenu"; // ✅ Import Here
import "./PaperMaker.css";

const PaperMaker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ✅ Menu State Moved Here (Parent)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const paperData = location.state;

  useEffect(() => {
    if (!paperData) {
      navigate("/user/generate-paper");
    }
  }, [paperData, navigate]);

  if (!paperData) return null;

  return (
    <div
      className={`pm-container ${theme === "dark" ? "pw-dark" : "pw-light"}`}
    >
      {/* ✅ Pass Toggle Function to Sidebar */}
      <MakerSidebar
        paperData={paperData}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <div className="pm-workspace">
        <PaperPreview paperData={paperData} />
      </div>

      {/* ✅ Render Menu Outside Sidebar (Clean Overlay) */}
      <QuestionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        paperData={paperData}
      />
    </div>
  );
};

export default PaperMaker;
