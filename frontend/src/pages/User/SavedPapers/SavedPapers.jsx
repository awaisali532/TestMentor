import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Components
import Loader from "../../../components/ui/Loader";
import SavedPapersList from "./components/SavedPapersList";

const SavedPapers = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Loaders
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'printing' or 'deleting'

  // --- 1. FETCH PAPERS WITH CACHING ---
  useEffect(() => {
    const fetchPapers = async () => {
      // ✅ Check Cache first for instant load
      const cachedPapers = localStorage.getItem("tm_saved_papers_cache");
      if (cachedPapers) {
        setPapers(JSON.parse(cachedPapers));
        setLoading(false);
        setIsRefreshing(true); // Fetch in background
      } else {
        setLoading(true);
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/papers/my-papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setPapers(res.data.papers);
          localStorage.setItem(
            "tm_saved_papers_cache",
            JSON.stringify(res.data.papers),
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load papers");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    fetchPapers();
  }, [BASE_URL]);

  // --- 2. ACTIONS ---
  const handleView = (id) => navigate(`/user/view-paper/${id}`);

  const handlePrint = async (paperSummary) => {
    setActionLoading("printing");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/papers/${paperSummary._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        navigate("/user/print-paper", { state: res.data.paper });
      } else {
        setActionLoading(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load paper for printing.");
      setActionLoading(null);
    }
  };

  const handleEdit = async (paper) => {
    const loadingToast = toast.loading("Loading for edit...");
    try {
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
      toast.dismiss(loadingToast);
      toast.error("Cannot open for editing.");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Paper?",
      text: "Are you sure you want to delete this paper? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Delete",
      background: "#0f172a",
      color: "#ffffff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading("deleting");
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${BASE_URL}/api/papers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const newPapers = papers.filter((p) => p._id !== id);
          setPapers(newPapers);
          localStorage.setItem(
            "tm_saved_papers_cache",
            JSON.stringify(newPapers),
          ); // Update cache
          toast.success("Paper deleted successfully");
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete paper");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  // Client-side Search Filter
  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative animate-fade-in pb-10">
      {/* Dynamic Loader Overlay for Actions */}
      {actionLoading && (
        <Loader
          fullScreen={true}
          text={
            actionLoading === "printing"
              ? "Preparing Paper for Print..."
              : "Deleting Paper..."
          }
        />
      )}

      {/* Main Page Loader */}
      {loading ? (
        <Loader fullScreen={false} text="Loading your papers..." />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-main mb-2 tracking-tight">
                My Saved Papers
              </h2>
              <p className="text-muted text-lg">
                Manage, print, and reuse your generated exams.
              </p>
            </div>
            <button
              onClick={() => navigate("/user/generate-paper")}
              className="flex items-center gap-2 bg-linear-to-br from-accent-1 to-accent-2 text-white font-bold px-6 py-3 rounded-xl hover:-translate-y-1 hover:shadow-lg shadow-accent-1/30 transition-all duration-300"
            >
              <FaPlus /> Create New Paper
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border text-main pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-accent-1 focus:ring-4 focus:ring-accent-1/10 transition-all font-medium shadow-sm"
            />
          </div>

          {/* Table or Empty State */}
          {filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-card border-2 border-dashed border-border rounded-2xl text-center">
              <div className="text-6xl mb-4 opacity-50 grayscale">📄</div>
              <h3 className="text-xl font-bold text-main mb-2">
                No papers found
              </h3>
              <p className="text-muted">
                You haven't created any papers yet or no match found.
              </p>
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
        </div>
      )}
    </div>
  );
};

export default SavedPapers;
