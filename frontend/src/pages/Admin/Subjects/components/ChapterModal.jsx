import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FolderTree,
  Plus,
  Edit3,
  X,
  Check,
  Loader2,
  Code,
  Copy,
  Sparkles,
  BookOpen,
} from "lucide-react";

const ChapterModal = ({
  isOpen,
  onClose,
  subject,
  isUrduSubject,
  initialData = null,
  onSuccess,
}) => {
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [chapterNumber, setChapterNumber] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [bulkJson, setBulkJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (initialData) {
      setMode("single");
      setChapterNumber(String(initialData.chapterNumber ?? ""));
      const en =
        initialData.name && typeof initialData.name === "object"
          ? initialData.name.en || ""
          : typeof initialData.name === "string"
          ? initialData.name
          : "";
      const ur =
        initialData.name && typeof initialData.name === "object"
          ? initialData.name.ur || ""
          : "";
      setNameEn(en);
      setNameUr(ur);
    } else {
      setChapterNumber("");
      setNameEn("");
      setNameUr("");
      setBulkJson("");
      setMode("single");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Single Chapter Submit (Add or Edit)
  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    if (!chapterNumber.trim()) {
      return toast.error("Chapter number is required!");
    }

    if (isUrduSubject) {
      if (!nameUr.trim()) {
        return toast.error("Urdu chapter title is required for this subject!");
      }
    } else {
      if (!nameEn.trim()) {
        return toast.error("English chapter title is required!");
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        subjectId: subject._id,
        chapterNumber: Number(chapterNumber),
        name: {
          en: nameEn.trim() || nameUr.trim(),
          ur: nameUr.trim(),
        },
      };

      if (initialData?._id) {
        await axios.put(`${API_URL}/chapters/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Chapter updated successfully!");
      } else {
        await axios.post(`${API_URL}/chapters/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Chapter created successfully!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save chapter";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Bulk Chapters Submit
  const handleBulkSubmit = async () => {
    if (!bulkJson.trim()) return toast.error("Please paste JSON data first");

    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of chapters");
    } catch (e) {
      return toast.error("Invalid JSON syntax: " + e.message);
    }

    const payload = parsed.map((item) => ({
      subject: subject._id,
      chapterNumber: Number(item.chapterNumber || item.number),
      name: {
        en: (item.nameEn || item.name || item.nameUr || "").trim(),
        ur: (item.nameUr || "").trim(),
      },
    }));

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/chapters/add-bulk`,
        { chapters: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data?.message || "Bulk chapters imported successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Bulk upload failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const sampleJson = JSON.stringify(
    [
      {
        chapterNumber: 1,
        nameEn: isUrduSubject ? "سبق نمبر 1" : "Physical Quantities and Measurement",
        nameUr: "طبعی مقداریں اور پیمائش",
      },
      {
        chapterNumber: 2,
        nameEn: isUrduSubject ? "سبق نمبر 2" : "Kinematics",
        nameUr: "حرکیات",
      },
      {
        chapterNumber: 3,
        nameEn: isUrduSubject ? "سبق نمبر 3" : "Dynamics",
        nameUr: "ڈائنامکس",
      },
    ],
    null,
    2
  );

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJson);
    setCopiedTemplate(true);
    toast.success("Sample template copied!");
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleInsertSample = () => {
    setBulkJson(sampleJson);
    toast.success("Sample template inserted!");
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-up my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-card z-20">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              {initialData ? <Edit3 className="w-5 h-5" /> : <FolderTree className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {subject?.className} • {subject?.subjectName}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-main mt-0.5">
                {initialData
                  ? `Edit Chapter ${initialData.chapterNumber}`
                  : mode === "bulk"
                  ? "Bulk Import Chapters (JSON)"
                  : "Add New Chapter"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-main p-2 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher (only for adding new) */}
        {!initialData && (
          <div className="px-6 pt-4 pb-1">
            <div className="flex items-center p-1 rounded-xl bg-pill-bg border border-border w-fit">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "single"
                    ? "bg-card text-accent-1 shadow-xs border border-border"
                    : "text-muted hover:text-main"
                }`}
              >
                Single Chapter
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "bulk"
                    ? "bg-card text-accent-1 shadow-xs border border-border"
                    : "text-muted hover:text-main"
                }`}
              >
                ⚡ Bulk JSON
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {mode === "single" ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              {/* Chapter Number */}
              <div>
                <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                  Chapter Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1, 2, 3..."
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(e.target.value)}
                  className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm placeholder:text-muted focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                  required
                />
              </div>

              {/* English Name */}
              <div>
                <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                  Chapter Title (English){" "}
                  {!isUrduSubject && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physical Quantities and Measurement"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm placeholder:text-muted focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                />
              </div>

              {/* Urdu Name */}
              <div>
                <label className="block text-xs font-bold text-main mb-1.5 uppercase tracking-wider">
                  Chapter Title (اردو میں){" "}
                  {isUrduSubject && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="طبعی مقداریں اور پیمائش"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  className="w-full bg-pill-bg border border-border rounded-xl px-4 py-2.5 text-main text-sm font-urdu placeholder:text-muted focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-border text-muted hover:text-main hover:bg-pill-bg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !chapterNumber.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{initialData ? "Update Chapter" : "Save Chapter"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted">
                  Paste JSON Array of Chapters:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsertSample}
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
                rows={7}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder={sampleJson}
                className="w-full bg-pill-bg border border-border rounded-2xl p-4 text-main font-mono text-xs focus:ring-2 focus:ring-accent-1/30 focus:border-accent-1 transition-all"
              />

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[11px] text-muted">
                  Chapters will be added to {subject?.subjectName} automatically.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-main hover:bg-pill-bg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={saving || !bulkJson.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-1 hover:bg-accent-1/90 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4" />
                    )}
                    <span>Upload Bulk Chapters</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChapterModal;
