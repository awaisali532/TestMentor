import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FolderTree,
  Plus,
  PlusCircle,
  Edit3,
  Trash2,
  Tag,
  Search,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Layers,
  X,
  List,
} from "lucide-react";

import ChapterModal from "./ChapterModal";
import TopicManagerModal from "./TopicManagerModal";

const ChapterSection = ({
  selectedClass,
  selectedSubject,
  onBackToSubjects,
  onRefreshGlobal,
}) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Chapter Modal State
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);

  // Topic Manager Modal State
  const [topicModalState, setTopicModalState] = useState({
    isOpen: false,
    chapter: null,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Check if subject is Urdu based
  const isUrduSubject =
    selectedSubject &&
    ["urdu", "islamiyat", "pak study", "tarjama", "arabic", "history", "mutalia"].some(
      (s) => selectedSubject.subjectName?.toLowerCase().includes(s)
    );

  const fetchChapters = async () => {
    if (!selectedSubject?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/chapters/subject/${selectedSubject._id}`
      );
      setChapters(res.data || []);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      toast.error("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [selectedSubject?._id]);

  // Safe Name Resolvers
  const getChapterNameEn = (ch) => {
    if (!ch) return "";
    if (ch.name && typeof ch.name === "object") return ch.name.en || "";
    if (typeof ch.name === "string") return ch.name;
    return "";
  };

  const getChapterNameUr = (ch) => {
    if (!ch) return "";
    if (ch.name && typeof ch.name === "object") return ch.name.ur || "";
    return "";
  };

  // Filter Chapters by Search
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase().trim();
    return chapters.filter((ch) => {
      const en = getChapterNameEn(ch).toLowerCase();
      const ur = getChapterNameUr(ch).toLowerCase();
      const num = String(ch.chapterNumber ?? "");
      return num.includes(q) || en.includes(q) || ur.includes(q);
    });
  }, [chapters, searchQuery]);

  // Edit Chapter Click (Safe populated data)
  const handleEditClick = (chapter) => {
    setEditingChapter(chapter);
    setIsChapterModalOpen(true);
  };

  // Open Add Chapter Modal
  const handleOpenAddModal = () => {
    setEditingChapter(null);
    setIsChapterModalOpen(true);
  };

  // Delete Chapter
  const handleDeleteChapter = async (id, title) => {
    const result = await Swal.fire({
      title: `Delete Chapter?`,
      text: "Warning: This will permanently delete this chapter along with its questions and syllabus topics!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      background: "var(--color-card, #1e293b)",
      color: "var(--color-main, #f8fafc)",
      customClass: {
        popup: "rounded-3xl border border-border shadow-2xl",
        confirmButton: "rounded-xl font-bold px-5 py-2.5 cursor-pointer",
        cancelButton: "rounded-xl font-semibold px-5 py-2.5 cursor-pointer",
      },
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/chapters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Chapter deleted successfully");
        fetchChapters();
        if (onRefreshGlobal) onRefreshGlobal();
      } catch (err) {
        toast.error("Failed to delete chapter");
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Bar with QuestionBank-Style Action Buttons */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <button
            onClick={onBackToSubjects}
            className="size-11 rounded-2xl border border-border bg-pill-bg/60 hover:bg-pill-bg text-main flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            title="Back to Subjects Selection"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-bold text-accent-1 bg-accent-1/10 px-2.5 py-0.5 rounded-full border border-accent-1/20">
                {selectedClass?.name}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {selectedSubject?.subjectName}
              </span>
              <span className="text-[11px] font-bold text-muted bg-pill-bg px-2 py-0.5 rounded-full border border-border">
                {chapters.length} Chapters
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-main tracking-tight">
              Chapter Syllabus Hierarchy 📚
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Manage chapters, dual-language titles, and topic classifications for question papers.
            </p>
          </div>
        </div>

        {/* Action Buttons (Styled identically to Question Bank Header) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Chapter</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Overview Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-accent-1/10 text-accent-1 flex items-center justify-center font-bold">
            <List className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold text-main">
            Configured Chapters ({chapters.length})
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by chapter number or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-pill-bg border border-border rounded-xl pl-9 pr-3.5 py-2 text-main text-xs placeholder:text-muted focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Full-Width Chapters List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-20 rounded-2xl bg-card border border-border animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FolderTree className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-main">
              {searchQuery ? "No Chapters Match Your Search" : "No Chapters Configured Yet"}
            </h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {searchQuery
                ? "Try searching with a different keyword or chapter number."
                : `Add your first chapter for ${selectedSubject?.subjectName} to start organizing questions and topics.`}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Chapter</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChapters.map((ch) => {
            const enName = getChapterNameEn(ch);
            const urName = getChapterNameUr(ch);
            const topicCount = ch.topics?.length || 0;

            return (
              <div
                key={ch._id}
                className="group relative rounded-2xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs"
              >
                {/* Chapter Number Badge & Dual Titles */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-md shadow-emerald-600/20">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-100">
                      CH
                    </span>
                    <span className="text-base leading-none">
                      {ch.chapterNumber}
                    </span>
                  </div>

                    <div className="min-w-0 flex-1">
                      {/* Urdu / English Titles Inline (Side-by-Side) */}
                      {isUrduSubject ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-lg font-bold font-urdu text-main leading-relaxed" dir="rtl">
                            {urName || "---"}
                          </h4>
                          {enName && (
                            <span className="text-xs font-medium text-muted">
                              ({enName})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-base font-extrabold text-main group-hover:text-accent-1 transition-colors">
                            {enName || "---"}
                          </h4>
                          {urName && (
                            <span className="text-base font-urdu font-bold text-muted/90" dir="rtl">
                              ({urName})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                </div>

                {/* Right Action Bar */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Manage Topics Button */}
                  <button
                    onClick={() =>
                      setTopicModalState({ isOpen: true, chapter: ch })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 transition-all cursor-pointer shadow-2xs"
                    title="Manage Chapter Topics"
                  >
                    <Tag className="w-4 h-4" />
                    <span>{topicCount > 0 ? `${topicCount} Topics` : "Topics"}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(ch)}
                    className="p-2 rounded-xl text-muted hover:text-accent-1 hover:bg-pill-bg border border-border transition-colors cursor-pointer"
                    title="Edit Chapter"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteChapter(ch._id, enName)}
                    className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-border transition-colors cursor-pointer"
                    title="Delete Chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Chapter Modal (Portaled) */}
      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => {
          setIsChapterModalOpen(false);
          setEditingChapter(null);
        }}
        subject={selectedSubject}
        isUrduSubject={isUrduSubject}
        initialData={editingChapter}
        onSuccess={() => {
          fetchChapters();
          if (onRefreshGlobal) onRefreshGlobal();
        }}
      />

      {/* 5. Topic Manager Modal (Portaled) */}
      {topicModalState.isOpen && (
        <TopicManagerModal
          isOpen={topicModalState.isOpen}
          onClose={() => setTopicModalState({ isOpen: false, chapter: null })}
          chapter={topicModalState.chapter}
          subject={selectedSubject}
          isUrduSubject={isUrduSubject}
        />
      )}
    </div>
  );
};

export default ChapterSection;
