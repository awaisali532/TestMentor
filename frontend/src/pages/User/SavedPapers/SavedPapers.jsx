import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

// ✅ Import New List Component
import SavedPapersList from "../../../components/SavedPapersList/SavedPapersList";
import "./SavedPapers.css";

const SavedPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/papers/my-papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // --- Actions ---

  const handleView = (id) => navigate(`/user/view-paper/${id}`);

  const handlePrint = (paper) => {
    // Filhal View page par le jate hain jahan Print ka option hota hai
    navigate(`/user/view-paper/${paper._id}`);
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
        };
        navigate("/user/manual-maker", { state: makerData });
      }
    } catch (err) {
      toast.error("Cannot open for editing.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/papers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPapers((prev) => prev.filter((p) => p._id !== id));
      toast.success("Paper deleted successfully");
    } catch (error) {
      toast.error("Failed to delete paper");
    }
  };

  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="sp-loader-container">
        <FaSpinner className="spin" /> <span>Loading your papers...</span>
      </div>
    );

  return (
    <div className="sp-page-container">
      {/* Header Section */}
      <div className="sp-page-header">
        <div>
          <h2 className="sp-title">My Saved Papers</h2>
          <p className="sp-subtitle">Manage and print your generated exams</p>
        </div>
        <button
          className="sp-create-btn"
          onClick={() => navigate("/user/generate-paper")}
        >
          <FaPlus /> Create New Paper
        </button>
      </div>

      {/* Search Bar */}
      <div className="sp-search-bar">
        <FaSearch className="sp-search-icon" />
        <input
          type="text"
          placeholder="Search by title or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content Section (Table) */}
      {filteredPapers.length === 0 ? (
        <div className="sp-empty-state">
          <div className="sp-empty-img">📄</div>
          <h3>No papers found</h3>
          <p>
            You haven't created any papers yet, or no search results matched.
          </p>
        </div>
      ) : (
        /* ✅ Replaced Grid with List Component */
        <SavedPapersList
          papers={filteredPapers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default SavedPapers;
