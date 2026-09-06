import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Calendar,
  ArrowLeft,
  Check,
  Loader2,
  UploadCloud,
  X,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const SubjectSection = ({
  selectedClass,
  selectedSubject,
  onSelect,
  onBackToClass,
  onRefreshGlobal,
}) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subjectName: "",
    year: "2025-2026",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchSubjects = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/subjects`);
      const target = String(selectedClass?.name || "").toLowerCase().trim();
      const filtered = (res.data || []).filter(
        (s) => String(s?.className || "").toLowerCase().trim() === target
      );
      setSubjects(filtered);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedClass]);

  // Check if Urdu subject
  const checkIsUrdu = (name) => {
    if (!name) return false;
    return ["urdu", "islamiyat", "pak study", "tarjama", "arabic", "history", "mutalia"].some(
      (u) => name.toLowerCase().includes(u)
    );
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setFormData({ subjectName: "", year: "2025-2026" });
    setSelectedFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (e, sub) => {
    e.stopPropagation();
    setEditingSubject(sub);
    setFormData({
      subjectName: sub.subjectName || "",
      year: sub.year || "2025-2026",
    });
    setSelectedFile(null);
    setImagePreview(sub.image?.url || null);
    setIsModalOpen(true);
  };

  // File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return toast.error("Please upload a valid image file");
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Submit Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.subjectName.trim();
    if (!trimmedName) return toast.error("Subject name is required");

    setActionLoading(true);
    const postData = new FormData();
    postData.append("subjectName", trimmedName);
    postData.append("className", selectedClass.name);
    postData.append("year", formData.year || "2025-2026");
    if (selectedFile) {
      postData.append("image", selectedFile);
    }

    try {
      const token = localStorage.getItem("token");
      if (editingSubject) {
        await axios.put(`${API_URL}/subjects/${editingSubject._id}`, postData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Subject updated successfully!");
      } else {
        await axios.post(`${API_URL}/subjects/add`, postData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("New subject created successfully!");
      }

      setIsModalOpen(false);
      fetchSubjects();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Operation failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Subject
  const handleDeleteSubject = async (e, sub) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: `Delete ${sub.subjectName}?`,
      text: `Are you sure? This will delete ${sub.subjectName} and all associated chapters and question associations!`,
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
        await axios.delete(`${API_URL}/subjects/${sub._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Subject "${sub.subjectName}" deleted`);
        fetchSubjects();
        if (onRefreshGlobal) onRefreshGlobal();
      } catch (err) {
        toast.error("Failed to delete subject");
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToClass}
            className="size-10 rounded-xl border border-border bg-pill-bg/60 hover:bg-pill-bg text-main flex items-center justify-center transition-all cursor-pointer"
            title="Back to Class Selection"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent-1 bg-accent-1/10 px-2 py-0.5 rounded-full">
                {selectedClass?.name}
              </span>
              <h3 className="text-lg font-extrabold text-main">
                Configured Subjects
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Select a subject to manage its chapter list and syllabus topics.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-card border border-border overflow-hidden animate-pulse flex flex-col"
            >
              <div className="h-44 w-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center space-y-4">
          <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-main">
              No Subjects for {selectedClass?.name}
            </h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Add your first subject (e.g. Physics, Chemistry, Biology, Urdu) to start configuring chapters.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {/* Add Subject Quick Card */}
          <button
            onClick={handleOpenAddModal}
            className="group relative rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/60 bg-pill-bg/30 hover:bg-emerald-500/5 p-5 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[250px] cursor-pointer"
          >
            <div className="size-12 rounded-2xl bg-card border border-border group-hover:border-emerald-500/40 group-hover:scale-110 text-muted group-hover:text-emerald-600 flex items-center justify-center transition-all shadow-xs mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-main group-hover:text-emerald-600 transition-colors">
              Add New Subject
            </span>
            <span className="text-[11px] text-muted font-medium mt-0.5">
              for {selectedClass?.name}
            </span>
          </button>

          {/* Subject Cards with Showcase Layout */}
          {subjects.map((sub) => {
            const isSelected = selectedSubject?._id === sub._id;
            const isUrdu = checkIsUrdu(sub.subjectName);

            return (
              <div
                key={sub._id}
                onClick={() => onSelect(sub)}
                className={`group relative rounded-2xl bg-card border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer flex flex-col ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10"
                    : "border-border hover:border-accent-1/50 hover:shadow-accent-1/10"
                }`}
              >
                {/* 1. Full Image Showcase Area with object-contain */}
                <div className="relative h-48 w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/90 dark:to-slate-900/90 flex items-center justify-center p-3 border-b border-border overflow-hidden">
                  {sub.image?.url ? (
                    <img
                      src={sub.image.url}
                      alt={sub.subjectName}
                      className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 relative z-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted group-hover:text-emerald-600 transition-colors">
                      <BookOpen className="w-12 h-12 opacity-60" />
                      <span className="text-[11px] font-semibold mt-2">
                        No Cover Image
                      </span>
                    </div>
                  )}

                  {/* Year Badge Top-Left */}
                  <div className="absolute top-3 left-3 z-10 bg-bg-body/90 backdrop-blur-md border border-border text-[10px] font-bold px-2.5 py-1 rounded-full text-accent-1 shadow-xs uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{sub.year || "2025-2026"}</span>
                  </div>

                  {/* Actions Bar Top-Right */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-bg-body/90 backdrop-blur-md border border-border p-1 rounded-xl shadow-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenEditModal(e, sub)}
                      title="Edit Subject"
                      className="p-1.5 rounded-lg text-muted hover:text-emerald-600 hover:bg-pill-bg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSubject(e, sub)}
                      title="Delete Subject"
                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Card Body */}
                <div className="p-4 flex flex-col justify-between flex-1 bg-card">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-base font-extrabold text-main group-hover:text-accent-1 transition-colors line-clamp-2 ${
                          isUrdu ? "font-urdu text-lg" : ""
                        }`}
                      >
                        {sub.subjectName}
                      </h4>
                      {isUrdu && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                          Urdu
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                    <span className="text-xs font-semibold text-muted">
                      {selectedClass?.name}
                    </span>
                    <span className="text-xs font-bold text-accent-1 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      <span>Chapters</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD / EDIT SUBJECT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  {editingSubject ? (
                    <Edit3 className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-main">
                    {editingSubject ? "Edit Subject" : "Add New Subject"}
                  </h3>
                  <p className="text-xs text-muted">
                    for grade {selectedClass?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-pill-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Cover Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                  Subject Cover Image (Optional)
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative h-36 w-full rounded-2xl border border-border overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Subject Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <label
                          htmlFor="subjectImageUpload"
                          className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold backdrop-blur-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="subjectImageUpload"
                      className="flex flex-col items-center justify-center h-32 w-full rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/50 bg-pill-bg/40 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                    >
                      <UploadCloud className="w-8 h-8 text-muted group-hover:text-emerald-600 transition-colors mb-1" />
                      <span className="text-xs font-bold text-main group-hover:text-emerald-600">
                        Upload Cover Image
                      </span>
                      <span className="text-[10px] text-muted">
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </label>
                  )}
                  <input
                    id="subjectImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Subject Name Input */}
              <div>
                <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics, Chemistry, Urdu Lazmi"
                  value={formData.subjectName}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectName: e.target.value })
                  }
                  className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-2026"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-main hover:bg-pill-bg text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !formData.subjectName.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingSubject ? "Save Changes" : "Create Subject"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSection;
