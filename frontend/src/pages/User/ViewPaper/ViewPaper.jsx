import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSpinner, FaEdit, FaPrint } from "react-icons/fa"; // ✅ Print Icon
import { useTheme } from "../../../context/ThemeContext";

import PaperPreview from "../../../components/PaperMaker/PaperPreview/PaperPreview";
import "./ViewPaper.css";

const ViewPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/papers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const apiData = res.data.paper;
          setPaper({
            ...apiData,
            selectedPattern: apiData.paperPattern,
            questions: apiData.questions,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleEdit = () => {
    if (!paper) return;
    const makerData = {
      _id: paper._id,
      title: paper.title,
      subject: paper.subject,
      grade: paper.grade,
      selectedPattern: paper.paperPattern || paper.selectedPattern,
      questions: paper.questions,
    };
    navigate("/user/manual-maker", { state: makerData });
  };

  // ✅ PRINT HANDLER
  const handlePrint = () => {
    if (!paper) return;
    navigate("/user/print-paper", { state: paper });
  };

  if (loading)
    return (
      <div className="vp-loading">
        <FaSpinner className="spin" /> Loading Paper...
      </div>
    );

  if (!paper) return <div className="vp-error">Paper not found.</div>;

  return (
    <div
      className={`vp-container ${theme === "dark" ? "vp-dark" : "vp-light"}`}
    >
      <div className="vp-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/user/saved-papers")}
            className="vp-btn back"
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="vp-title">{paper.title}</h2>
        </div>

        <div className="vp-actions">
          <button onClick={handleEdit} className="vp-btn edit">
            <FaEdit /> Edit
          </button>

          {/* ✅ PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="vp-btn print"
            style={{ background: "#10b981", color: "white" }}
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      <div className="vp-scroll-area">
        <div className="vp-paper-wrapper">
          <PaperPreview paperData={paper} onOpenMenu={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default ViewPaper;
