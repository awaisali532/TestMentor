import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  GraduationCap,
  X,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const ClassSection = ({
  selectedClass,
  onSelect,
  allSubjects = [],
  onRefreshGlobal,
}) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState("");
  const [editingClass, setEditingClass] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/subjects/classes/all`);
      setClasses(res.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Calculate subjects count per class
  const getSubjectCountForClass = (clsName) => {
    if (!clsName || !allSubjects || !Array.isArray(allSubjects)) return 0;
    const target = String(clsName).toLowerCase().trim();
    return allSubjects.filter(
      (s) => String(s?.className || "").toLowerCase().trim() === target
    ).length;
  };

  // --- 1. ADD CLASS ---
  const handleOpenAddModal = () => {
    setClassNameInput("");
    setIsAddModalOpen(true);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const trimmed = classNameInput.trim();
    if (!trimmed) return toast.error("Please enter a class name");

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/subjects/classes/add`,
        { name: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Class "${trimmed}" added successfully!`);
      setIsAddModalOpen(false);
      setClassNameInput("");
      fetchClasses();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to add class";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // --- 2. EDIT CLASS ---
  const handleOpenEditModal = (e, cls) => {
    e.stopPropagation();
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setIsEditModalOpen(true);
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    const trimmed = classNameInput.trim();
    if (!trimmed) return toast.error("Class name cannot be empty");
    if (trimmed === editingClass.name) {
      setIsEditModalOpen(false);
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/subjects/classes/${editingClass._id}`,
        { name: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Class updated successfully!");
      setIsEditModalOpen(false);
      setEditingClass(null);
      setClassNameInput("");
      fetchClasses();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update class";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // --- 3. DELETE CLASS ---
  const handleDeleteClass = async (e, cls) => {
    e.stopPropagation();
    const subCount = getSubjectCountForClass(cls.name);

    const result = await Swal.fire({
      title: `Delete ${cls.name}?`,
      text: subCount > 0 
        ? `Warning: This will permanently delete ${cls.name} along with its ${subCount} subject(s) and all their chapters!`
        : "Are you sure you want to delete this class level?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      background: "var(--color-card, #1e293b)",
      color: "var(--color-main, #f8fafc)",
      customClass: {
        popup: "rounded-3xl border border-border shadow-2xl",
        confirmButton: "rounded-xl font-bold px-5 py-2.5",
        cancelButton: "rounded-xl font-semibold px-5 py-2.5",
      },
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/subjects/classes/${cls._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Class "${cls.name}" deleted`);
        fetchClasses();
        if (onRefreshGlobal) onRefreshGlobal();
      } catch (err) {
        toast.error("Failed to delete class");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Aesthetic Grade Themes & Badges
  const getGradeMeta = (name, idx) => {
    const clean = String(name || "").toLowerCase();
    let badge = "Academic Level";
    let gradeNumber = "";

    if (clean.includes("9")) {
      badge = "Matriculation (Part I)";
      gradeNumber = "9th";
    } else if (clean.includes("10")) {
      badge = "Matriculation (Part II)";
      gradeNumber = "10th";
    } else if (clean.includes("11") || clean.includes("1st")) {
      badge = "Intermediate (Part I)";
      gradeNumber = "11th";
    } else if (clean.includes("12") || clean.includes("2nd")) {
      badge = "Intermediate (Part II)";
      gradeNumber = "12th";
    } else {
      gradeNumber = `G${idx + 1}`;
    }

    const palettes = [
      {
        gradient: "from-blue-600 via-indigo-600 to-cyan-500",
        lightBg: "from-blue-500/10 via-indigo-500/5 to-transparent",
        accentBorder: "hover:border-blue-500/50",
        selectedBorder: "border-blue-500 ring-2 ring-blue-500/30",
        tag: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        btn: "text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
      },
      {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        lightBg: "from-emerald-500/10 via-teal-500/5 to-transparent",
        accentBorder: "hover:border-emerald-500/50",
        selectedBorder: "border-emerald-500 ring-2 ring-emerald-500/30",
        tag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        btn: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20",
      },
      {
        gradient: "from-purple-600 via-pink-600 to-indigo-600",
        lightBg: "from-purple-500/10 via-pink-500/5 to-transparent",
        accentBorder: "hover:border-purple-500/50",
        selectedBorder: "border-purple-500 ring-2 ring-purple-500/30",
        tag: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        btn: "text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20",
      },
      {
        gradient: "from-amber-600 via-orange-600 to-yellow-500",
        lightBg: "from-amber-500/10 via-orange-500/5 to-transparent",
        accentBorder: "hover:border-amber-500/50",
        selectedBorder: "border-amber-500 ring-2 ring-amber-500/30",
        tag: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        btn: "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
      },
      {
        gradient: "from-rose-600 via-red-600 to-pink-600",
        lightBg: "from-rose-500/10 via-red-500/5 to-transparent",
        accentBorder: "hover:border-rose-500/50",
        selectedBorder: "border-rose-500 ring-2 ring-rose-500/30",
        tag: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        btn: "text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20",
      },
      {
        gradient: "from-cyan-600 via-teal-600 to-blue-600",
        lightBg: "from-cyan-500/10 via-teal-500/5 to-transparent",
        accentBorder: "hover:border-cyan-500/50",
        selectedBorder: "border-cyan-500 ring-2 ring-cyan-500/30",
        tag: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
        btn: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20",
      },
    ];

    return {
      badge,
      gradeNumber,
      palette: palettes[idx % palettes.length],
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-3xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-1/10 text-accent-1 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Grades Management</span>
          </div>
          <h3 className="text-xl font-extrabold text-main flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-accent-1" />
            <span>Select Class / Grade Level</span>
          </h3>
          <p className="text-xs text-muted mt-1">
            Choose a grade level to configure subjects, chapters, and curriculum syllabus.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-1 hover:bg-accent-1/90 active:scale-95 text-white text-xs font-bold shadow-md shadow-accent-1/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Grid of Classes */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-52 rounded-3xl bg-card border border-border p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center space-y-4">
          <div className="size-16 rounded-2xl bg-accent-1/10 text-accent-1 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-main">No Class Levels Found</h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Get started by adding your first academic grade level (e.g. 9th Class, 10th Class).
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-1 hover:bg-accent-1/90 text-white text-xs font-bold shadow-md shadow-accent-1/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Class</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Aesthetic Add New Class Quick Card */}
          <button
            onClick={handleOpenAddModal}
            className="group relative rounded-3xl border-2 border-dashed border-border hover:border-accent-1/60 bg-pill-bg/30 hover:bg-accent-1/5 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[210px] cursor-pointer"
          >
            <div className="size-14 rounded-2xl bg-card border border-border group-hover:border-accent-1/40 group-hover:scale-110 text-muted group-hover:text-accent-1 flex items-center justify-center transition-all shadow-xs mb-3 group-hover:shadow-md">
              <Plus className="w-7 h-7" />
            </div>
            <span className="text-sm font-extrabold text-main group-hover:text-accent-1 transition-colors">
              Add New Class
            </span>
            <span className="text-xs text-muted font-medium mt-1">
              Create grade level & curriculum
            </span>
          </button>

          {/* Aesthetic Class Cards */}
          {classes.map((cls, idx) => {
            const isSelected = selectedClass?._id === cls._id;
            const subCount = getSubjectCountForClass(cls.name);
            const { badge, gradeNumber, palette } = getGradeMeta(cls.name, idx);

            return (
              <div
                key={cls._id}
                onClick={() => onSelect(cls)}
                className={`group relative rounded-3xl bg-card border p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[210px] overflow-hidden ${
                  isSelected
                    ? `${palette.selectedBorder} shadow-xl bg-gradient-to-br ${palette.lightBg}`
                    : `border-border ${palette.accentBorder} hover:shadow-xl hover:-translate-y-1`
                }`}
              >
                {/* Background Watermark Grade Label */}
                <div className="absolute right-2 -bottom-2 text-7xl font-black text-main/[0.04] pointer-events-none select-none tracking-tighter">
                  {gradeNumber}
                </div>

                {/* Top Row: 3D Emblem & Actions */}
                <div className="relative z-10 flex items-start justify-between">
                  <div
                    className={`size-12 rounded-2xl bg-gradient-to-br ${palette.gradient} text-white flex items-center justify-center font-black shadow-md shadow-black/10 group-hover:scale-105 transition-transform`}
                  >
                    <GraduationCap className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${palette.tag} uppercase tracking-wider`}>
                      {badge}
                    </span>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-0.5 ms-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEditModal(e, cls)}
                        title="Edit Class Name"
                        className="p-1.5 rounded-lg text-muted hover:text-accent-1 hover:bg-pill-bg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClass(e, cls)}
                        title="Delete Class"
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center: Class Details */}
                <div className="relative z-10 my-3">
                  <h4 className="text-xl font-black text-main tracking-tight group-hover:text-accent-1 transition-colors">
                    {cls.name}
                  </h4>
                  <p className="text-xs text-muted font-medium mt-0.5">
                    Click to view and configure syllabus
                  </p>
                </div>

                {/* Bottom Row: Stats and Action */}
                <div className="relative z-10 flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                    <BookOpen className="w-3.5 h-3.5 text-accent-1" />
                    <span>
                      {subCount} {subCount === 1 ? "Subject" : "Subjects"}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all group-hover:translate-x-0.5 ${
                      isSelected
                        ? "bg-accent-1 text-white shadow-md shadow-accent-1/30"
                        : palette.btn
                    }`}
                  >
                    <span>{isSelected ? "Active" : "Explore"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD CLASS MODAL (PORTALED) --- */}
      {isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-2xl bg-accent-1/10 text-accent-1 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-main">Add New Class</h3>
                    <p className="text-xs text-muted">Create academic grade level</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                    Class / Grade Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. 9th Class, 10th Class, FSC Part 1"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-main hover:bg-pill-bg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !classNameInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-1 hover:bg-accent-1/90 text-white text-xs font-bold shadow-md shadow-accent-1/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Create Class</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* --- EDIT CLASS MODAL (PORTALED) --- */}
      {isEditModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-main">Edit Class Name</h3>
                    <p className="text-xs text-muted">Update academic grade</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateClass} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                    Class / Grade Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. 9th Class"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-main hover:bg-pill-bg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !classNameInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ClassSection;
