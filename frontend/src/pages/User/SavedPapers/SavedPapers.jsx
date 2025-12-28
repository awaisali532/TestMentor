import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// ✅ Custom TM Loader
import TMLoader from "../../../components/common/TMLoader/TMLoader";
import SavedPapersList from "../../../components/SavedPapersList/SavedPapersList";
import "./SavedPapers.css";

const SavedPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOADERS STATE
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false); // 🆕 New State for Print

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- 1. FETCH PAPERS LIST ---
  useEffect(() => {
    const fetchPapers = async () => {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const token = localStorage.getItem("token");

        const [res] = await Promise.all([
          axios.get(`${BASE_URL}/api/papers/my-papers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          minDelay,
        ]);

        if (res.data.success) {
          setPapers(res.data.papers);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load papers");
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // --- ACTIONS ---

  const handleView = (id) => navigate(`/user/view-paper/${id}`);

  // ✅ UPDATED: PRINT WITH TM LOADER
  const handlePrint = async (paperSummary) => {
    // 1. TM Loader Start
    setIsPrinting(true);

    try {
      const token = localStorage.getItem("token");

      // 2. Full Data Fetch
      const res = await axios.get(
        `${BASE_URL}/api/papers/${paperSummary._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        // 3. Success hone par navigate (Loader band karne ki zaroorat nahi, page badal jayega)
        navigate("/user/print-paper", { state: res.data.paper });
      } else {
        setIsPrinting(false); // Agar success false ho to loader band kro
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load paper for printing.");
      setIsPrinting(false); // Error par loader band kro
    }
  };

  const handleEdit = async (paper) => {
    try {
      const loadingToast = toast.loading("Loading for edit...");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/papers/${paper._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.dismiss(loadingToast);

      if (res.data.success) {
        const fullData = res.data.paper;
        const makerData = {
          ...fullData,
          selectedPattern: fullData.paperPattern,
          questions: fullData.questions,
          examLabel: fullData.examLabel,
          syllabusLabel: fullData.syllabusLabel,
        };
        navigate("/user/paper-maker", { state: makerData, keepData: true });
      }
    } catch (err) {
      toast.error("Cannot open for editing.");
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true); // 🟢 DELETE LOADER ON

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/papers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPapers((prev) => prev.filter((p) => p._id !== id));
      toast.success("Paper deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete paper");
    } finally {
      setIsDeleting(false); // 🔴 LOADER OFF
    }
  };

  // Search Filter
  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sp-page-container">
      <Toaster position="top-right" />

      {/* ✅ 1. SHOW LOADER IF PRINTING */}
      {isPrinting && <TMLoader message="Preparing Paper for Print..." />}

      {/* ✅ 2. SHOW LOADER IF DELETING */}
      {isDeleting && <TMLoader message="Deleting Paper..." />}

      {/* ✅ 3. SHOW LOADER IF INITIAL FETCHING */}
      {loading ? (
        <TMLoader message="Loading your papers..." />
      ) : (
        <>
          {/* Header Section */}
          <div className="sp-page-header">
            <div>
              <h2 className="sp-title">My Saved Papers</h2>
              <p className="sp-subtitle">
                Manage and print your generated exams
              </p>
            </div>
            <button
              className="sp-create-btn"
              onClick={() => navigate("/user/generate-paper")}
            >
              <FaPlus /> Create New Paper
            </button>
          </div>

          <div className="sp-search-bar">
            <FaSearch className="sp-search-icon" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredPapers.length === 0 ? (
            <div className="sp-empty-state">
              <div className="sp-empty-img">📄</div>
              <h3>No papers found</h3>
              <p>You haven't created any papers yet.</p>
            </div>
          ) : (
            <SavedPapersList
              papers={filteredPapers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPrint={handlePrint}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SavedPapers;
