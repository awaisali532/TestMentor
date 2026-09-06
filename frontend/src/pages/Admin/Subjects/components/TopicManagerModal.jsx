import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Code,
  Copy,
  Check,
  Loader2,
  X,
  List,
  Sparkles,
  BookOpen,
} from "lucide-react";

const TopicManagerModal = ({
  isOpen,
  onClose,
  chapter,
  subject,
  isUrduSubject,
}) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form mode: "single" or "bulk"
  const [mode, setMode] = useState("single");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    topicNumber: "",
    nameEn: "",
    nameUr: "",
  });

  const [bulkJson, setBulkJson] = useState("");
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchTopics = async () => {
    if (!chapter?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/topics/chapter/${chapter._id}`);
      setTopics(res.data || []);
    } catch (err) {
      console.error("Error fetching topics:", err);
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && chapter?._id) {
      fetchTopics();
      resetForm();
    }
  }, [isOpen, chapter?._id]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ topicNumber: "", nameEn: "", nameUr: "" });
    setBulkJson("");
    setMode("single");
  };

  const handleEditClick = (topic) => {
    setEditingId(topic._id);
    setMode("single");
    setFormData({
      topicNumber: topic.topicNumber || "",
      nameEn: typeof topic.name === "object" ? topic.name.en || "" : topic.name || "",
      nameUr: typeof topic.name === "object" ? topic.name.ur || "" : "",
    });
  };

  // 1. Submit Single Topic
  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    if (!formData.topicNumber) return toast.error("Topic number is required");

    if (isUrduSubject) {
      if (!formData.nameUr.trim()) return toast.error("Urdu topic title is required!");
    } else {
      if (!formData.nameEn.trim()) return toast.error("English topic title is required!");
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        chapterId: chapter._id,
        topicNumber: formData.topicNumber,
        name: {
          en: formData.nameEn.trim(),
          ur: formData.nameUr.trim(),
        },
      };

      if (editingId) {
        await axios.put(`${API_URL}/topics/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Topic updated successfully!");
      } else {
        await axios.post(`${API_URL}/topics/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Topic added successfully!");
      }

      resetForm();
      fetchTopics();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Submit Bulk JSON
  const handleBulkUpload = async () => {
    if (!bulkJson.trim()) return toast.error("Please paste JSON data first");

    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of topics");
    } catch (e) {
      return toast.error("Invalid JSON syntax: " + e.message);
    }

    const payload = parsed.map((item) => ({
      chapter: chapter._id,
      topicNumber: item.topicNumber || item.number,
      name: {
        en: item.nameEn || item.name || "",
        ur: item.nameUr || "",
      },
    }));

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/topics/add-bulk`,
        { topics: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data?.message || "Bulk topics imported successfully!");
      resetForm();
      fetchTopics();
    } catch (err) {
      const msg = err.response?.data?.message || "Bulk import failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete Topic
  const handleDeleteTopic = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete Topic?",
      text: "Are you sure you want to remove this topic?",
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
        await axios.delete(`${API_URL}/topics/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Topic removed");
        fetchTopics();
      } catch (err) {
        toast.error("Failed to delete topic");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Sample JSON Template
  const sampleJsonTemplate = JSON.stringify(
    [
      { topicNumber: "1.1", nameEn: "Introduction", nameUr: "تعارف" },
      { topicNumber: "1.2", nameEn: "Core Concepts", nameUr: "بنیادی تصورات" },
    ],
    null,
    2
  );

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate);
    setCopiedTemplate(true);
    toast.success("Sample template copied to clipboard!");
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  if (!isOpen) return null;

  const handleInsertTemplate = () => {
    setBulkJson(sampleJsonTemplate);
    toast.success("Sample template inserted into editor!");
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-5xl 2xl:max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:px-6 border-b border-border flex items-center justify-between shrink-0 bg-card z-20">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Chapter {chapter?.chapterNumber}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-main truncate">
                  {(chapter?.name && typeof chapter.name === "object")
                    ? chapter.name.en || chapter.name.ur
                    : (chapter?.name || "Chapter")}{" "}
                  — Syllabus Topics
                </h3>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {subject?.subjectName} ({subject?.className}) • Manage topics & question classification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-main p-2 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Top Form Area & Topics List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* Top Form Area */}
          <div className="bg-pill-bg/50 border border-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{editingId ? "Edit Topic Details" : "Add New Topic"}</span>
                </span>
              </div>

              {!editingId && (
                <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setMode("single")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === "single"
                        ? "bg-accent-1 text-white shadow-xs"
                        : "text-muted hover:text-main"
                    }`}
                  >
                    Single Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("bulk")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === "bulk"
                        ? "bg-accent-1 text-white shadow-xs"
                        : "text-muted hover:text-main"
                    }`}
                  >
                    ⚡ Bulk JSON
                  </button>
                </div>
              )}
            </div>

            {mode === "single" ? (
              <form onSubmit={handleSubmitSingle} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase">
                      Topic No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.1, 1.2"
                      value={formData.topicNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, topicNumber: e.target.value })
                      }
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-main text-xs focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase">
                      Title (English){" "}
                      {!isUrduSubject && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Physical Quantities"
                      value={formData.nameEn}
                      onChange={(e) =>
                        setFormData({ ...formData, nameEn: e.target.value })
                      }
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-main text-xs focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase">
                      Title (Urdu){" "}
                      {isUrduSubject && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="عنوان (اردو میں)"
                      value={formData.nameUr}
                      onChange={(e) =>
                        setFormData({ ...formData, nameUr: e.target.value })
                      }
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-main text-xs font-urdu focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-xl border border-border text-muted hover:text-main text-xs font-semibold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{editingId ? "Update Topic" : "Save Topic"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-muted">
                    Paste JSON Array of Topics:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-accent-1 bg-accent-1/10 hover:bg-accent-1/20 border border-accent-1/20 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Insert Sample</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-muted hover:text-main bg-card border border-border transition-colors cursor-pointer"
                    >
                      {copiedTemplate ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Template</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder={`[\n  { "topicNumber": "1.1", "nameEn": "Intro to Physics", "nameUr": "طبیعیات کا تعارف" },\n  { "topicNumber": "1.2", "nameEn": "Physical Quantities", "nameUr": "طبعی مقداریں" }\n]`}
                  className="w-full bg-card border border-border rounded-2xl p-4 text-main font-mono text-xs focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted">
                    Topics will be added to Chapter {chapter?.chapterNumber} automatically.
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    disabled={actionLoading || !bulkJson.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent-1 hover:bg-accent-1/90 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Code className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Bulk Topics</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Topics List Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-2">
                <List className="w-4 h-4 text-accent-1" />
                <span>Configured Topics ({topics.length})</span>
              </h4>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-12 rounded-xl bg-pill-bg border border-border animate-pulse"
                  ></div>
                ))}
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-10 text-muted text-xs bg-pill-bg/30 rounded-2xl border border-dashed border-border">
                No topics added for this chapter yet. Add single topics or import via JSON above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {topics.map((t) => {
                  const isEditingThis = editingId === t._id;
                  const enTitle =
                    (t?.name && typeof t.name === "object")
                      ? t.name.en || ""
                      : (typeof t?.name === "string" ? t.name : "");
                  const urTitle =
                    (t?.name && typeof t.name === "object") ? t.name.ur || "" : "";

                  return (
                    <div
                      key={t._id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isEditingThis
                          ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20"
                          : "bg-card border-border hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 font-mono">
                          {t.topicNumber}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-bold text-main">
                            {enTitle || "---"}
                          </span>
                          {urTitle && (
                            <span className="text-xs font-urdu text-muted ms-2" dir="rtl">
                              ({urTitle})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClick(t)}
                          className="p-1.5 rounded-lg text-muted hover:text-accent-1 hover:bg-pill-bg transition-colors cursor-pointer"
                          title="Edit Topic"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(t._id, enTitle)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-border bg-pill-bg/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-card border border-border text-main hover:bg-pill-bg text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TopicManagerModal;
