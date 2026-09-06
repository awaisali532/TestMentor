import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  X,
  Zap,
  Layers,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Wand2,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import {
  BULK_EXAMPLES,
  getExampleForSubject,
} from "../../../../config/bulkQuestionExamples";

const BulkAddQuestionModal = ({
  isOpen,
  onClose,
  allSubjects = [],
  activeClass,
  activeSubject,
  activeChapter,
  activeTopic,
  onSuccess,
}) => {
  const [classLevel, setClassLevel] = useState("9th");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");

  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);
  const [activeExampleTab, setActiveExampleTab] = useState("Science");

  const [modalChapters, setModalChapters] = useState([]);
  const [chapterTopics, setChapterTopics] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Pre-fill active selection when modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeClass) setClassLevel(activeClass);
      if (activeSubject) setSubjectId(activeSubject);
      if (activeChapter) setChapterId(activeChapter);
    }
  }, [isOpen, activeClass, activeSubject, activeChapter]);

  // Determine current subject name for intelligent template auto-selection
  const selectedSubjectObj = useMemo(() => {
    return allSubjects.find((s) => s._id === subjectId) || null;
  }, [allSubjects, subjectId]);

  useEffect(() => {
    if (selectedSubjectObj?.subjectName) {
      const name = selectedSubjectObj.subjectName.toLowerCase();
      if (name.includes("english")) setActiveExampleTab("English");
      else if (name.includes("urdu")) setActiveExampleTab("Urdu");
      else if (
        name.includes("islam") ||
        name.includes("tarjama") ||
        name.includes("quran") ||
        name.includes("arabic")
      ) {
        setActiveExampleTab("Islamiyat");
      } else if (
        name.includes("math") ||
        name.includes("phys") ||
        name.includes("chem") ||
        name.includes("bio") ||
        name.includes("comp")
      ) {
        setActiveExampleTab("Science");
      } else {
        setActiveExampleTab("Default");
      }
    }
  }, [selectedSubjectObj]);

  // Fetch Chapters when subjectId changes
  useEffect(() => {
    if (!subjectId) {
      setModalChapters([]);
      setChapterId("");
      return;
    }
    const fetchChapters = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/chapters/subject/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setModalChapters(
          Array.isArray(res.data) ? res.data : res.data?.chapters || []
        );
      } catch (err) {
        console.error("Error fetching chapters for bulk modal:", err);
      }
    };
    fetchChapters();
  }, [subjectId, API_URL]);

  // Fetch Topics when chapterId changes to display available topic numbers
  useEffect(() => {
    if (!chapterId) {
      setChapterTopics([]);
      return;
    }
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/topics/chapter/${chapterId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChapterTopics(
          Array.isArray(res.data) ? res.data : res.data?.topics || []
        );
      } catch (err) {
        console.error("Error fetching chapter topics for bulk modal:", err);
      }
    };
    fetchTopics();
  }, [chapterId, API_URL]);

  // Available subjects for selected class
  const availableSubjects = useMemo(() => {
    if (!classLevel) return allSubjects;
    return allSubjects.filter(
      (s) =>
        String(s.className || "").toLowerCase().trim() ===
        String(classLevel).toLowerCase().trim()
    );
  }, [allSubjects, classLevel]);

  // LaTeX Auto-Fixer: fixes unescaped backslashes in formulas
  const sanitizeJson = (input) => {
    if (!input) return "";
    let fixed = input.replace(/\\([^"\\/bfnrtu])/g, "\\\\$1");
    fixed = fixed.replace(
      /\\(times|theta|tau|tan|nu|neq|mu|pi|alpha|beta|gamma|delta|frac|sqrt|hat|vec|pm|approx|leq|geq)/g,
      "\\\\$1"
    );
    return fixed;
  };

  const handleApplyAutoFix = () => {
    const fixed = sanitizeJson(jsonInput);
    setJsonInput(fixed);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "LaTeX backslashes auto-fixed!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Real-time JSON validation & summary
  const jsonValidation = useMemo(() => {
    if (!jsonInput.trim()) return null;
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch {
        parsed = JSON.parse(sanitizeJson(jsonInput));
      }

      if (!Array.isArray(parsed)) {
        return { isValid: false, message: "JSON root must be an Array [ ... ]" };
      }

      const mcqCount = parsed.filter((q) => (q.type || "").toUpperCase() === "MCQ").length;
      const shortCount = parsed.filter((q) => (q.type || "").toUpperCase() === "SHORT").length;
      const longCount = parsed.filter((q) => (q.type || "").toUpperCase() === "LONG").length;
      const otherCount = parsed.length - (mcqCount + shortCount + longCount);

      return {
        isValid: true,
        total: parsed.length,
        mcqCount,
        shortCount,
        longCount,
        otherCount,
      };
    } catch (err) {
      return { isValid: false, message: err.message };
    }
  }, [jsonInput]);

  const handleCopyExample = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  const handleLoadExampleIntoEditor = (text) => {
    setJsonInput(text);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Template loaded into editor!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!subjectId) return Swal.fire("Warning", "Please select a Target Subject!", "warning");
    if (!chapterId) return Swal.fire("Warning", "Please select a Target Chapter!", "warning");
    if (!jsonInput.trim()) return Swal.fire("Warning", "Please enter or paste JSON questions!", "warning");

    let parsedQuestions = [];
    try {
      try {
        parsedQuestions = JSON.parse(jsonInput);
      } catch {
        const fixed = sanitizeJson(jsonInput);
        parsedQuestions = JSON.parse(fixed);
      }
    } catch (err) {
      return Swal.fire({
        title: "Invalid JSON Syntax",
        text: "Please check for missing quotes or commas. You can click 'Auto-Fix LaTeX' to fix math symbols.",
        footer: `<span style="color:#ef4444; font-family:monospace; font-size:12px;">${err.message}</span>`,
        icon: "error",
      });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return Swal.fire("Error", "JSON must be a non-empty array of questions [ ... ]", "error");
    }

    // Client-side normalization
    try {
      const normalized = parsedQuestions.map((q, idx) => {
        const itemNum = idx + 1;
        const qType = (q.type || "MCQ").toUpperCase();

        if (!["MCQ", "SHORT", "LONG"].includes(qType)) {
          throw new Error(`Item #${itemNum}: Type must be 'MCQ', 'SHORT', or 'LONG'.`);
        }

        let categories = ["TEXT"];
        if (q.questionCategory) {
          categories = Array.isArray(q.questionCategory)
            ? q.questionCategory
            : [q.questionCategory];
        } else if (qType === "MCQ") {
          categories = ["MCQ_GENERAL"];
        }

        // Validate MCQ options
        if (qType === "MCQ") {
          if (!Array.isArray(q.options) || q.options.length < 4) {
            throw new Error(`Item #${itemNum} (MCQ): Must contain at least 4 options.`);
          }
          const hasCorrect = q.options.some((opt) => opt.isCorrect === true);
          if (!hasCorrect) {
            throw new Error(`Item #${itemNum} (MCQ): At least one option must have "isCorrect": true.`);
          }
        }

        return {
          ...q,
          type: qType,
          questionCategory: categories,
          difficulty: q.difficulty || "Medium",
          marks: q.marks || (qType === "MCQ" ? 1 : qType === "SHORT" ? 2 : 5),
        };
      });

      setImporting(true);
      const token = localStorage.getItem("token");

      const payload = {
        questions: normalized,
        chapterId,
        subjectId,
        classLevel,
      };

      const res = await axios.post(`${API_URL}/questions/bulk-add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { successCount, failedQuestions = [] } = res.data;

      if (failedQuestions.length > 0) {
        let errorDetails = `<div style="max-height: 200px; overflow-y: auto; text-align: left; font-size: 12px;">`;
        failedQuestions.forEach((f) => {
          errorDetails += `
            <div style="margin-bottom: 6px; padding: 6px 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 6px;">
              <strong>Item #${f.index}:</strong> ${f.reason} ${f.statement ? `(${f.statement.substring(0, 40)}...)` : ""}
            </div>
          `;
        });
        errorDetails += `</div>`;

        await Swal.fire({
          title: "Batch Processed (With Warnings)",
          html: `<p style="margin-bottom: 12px; font-weight: 600;">✅ ${successCount} questions imported successfully.<br/>⚠️ ${failedQuestions.length} failed:</p>${errorDetails}`,
          icon: "warning",
          confirmButtonText: "OK",
          confirmButtonColor: "#0ea5e9",
        });
      } else {
        await Swal.fire({
          title: "Success!",
          text: `All ${successCount} questions imported successfully into Chapter!`,
          icon: "success",
          timer: 2200,
          showConfirmButton: false,
        });
      }

      setJsonInput("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Bulk upload error:", err);
      Swal.fire({
        title: "Upload Failed",
        text: err.message || err.response?.data?.error || "Failed to process bulk upload.",
        icon: "error",
      });
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const currentExampleCode = BULK_EXAMPLES[activeExampleTab] || BULK_EXAMPLES.Default;

  const safeTitle = (item) => {
    if (!item) return "";
    if (typeof item.name === "string") return item.name;
    if (typeof item.name === "object") return item.name?.en || item.name?.ur || "";
    if (typeof item.title === "string") return item.title;
    if (typeof item.title === "object") return item.title?.en || item.title?.ur || "";
    return "";
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-7xl 2xl:max-w-[1520px] rounded-3xl shadow-2xl overflow-hidden my-3 animate-scale-up flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-pill-bg/60 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-main">
                  Bulk Add Questions (Unified JSON Upload)
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-accent-1/10 text-accent-1">
                  MCQ + Short + Long in One Go
                </span>
              </div>
              <p className="text-xs text-muted">
                Paste a single JSON array containing any mix of MCQs, Short Questions, and Long Questions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-main p-2 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split View (Left: Classification & Templates, Right: JSON Editor) */}
        <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 custom-scrollbar">
          {/* Target Classification Bar */}
          <div className="bg-pill-bg/40 border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-main uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-1" />
                <span>1. Select Target Hierarchy</span>
              </h3>
              {chapterTopics.length > 0 && (
                <span className="text-[11px] font-semibold text-muted">
                  Available Topics in Chapter:{" "}
                  <span className="text-accent-1 font-bold">
                    {chapterTopics.map((t) => t.topicNumber).filter(Boolean).join(", ") || `${chapterTopics.length} topics`}
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Class Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => {
                    setClassLevel(e.target.value);
                    setSubjectId("");
                    setChapterId("");
                  }}
                  required
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all cursor-pointer"
                >
                  <option value="9th">Class 9th</option>
                  <option value="10th">Class 10th</option>
                  <option value="11th">Class 11th</option>
                  <option value="12th">Class 12th</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId("");
                  }}
                  required
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all cursor-pointer"
                >
                  <option value="">-- Select Subject --</option>
                  {availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectName} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Chapter <span className="text-red-500">*</span>
                </label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  required
                  disabled={!subjectId}
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <option value="">Select Chapter</option>
                  {modalChapters.map((ch, i) => (
                    <option key={ch._id || i} value={ch._id}>
                      Ch {ch.chapterNumber}: {safeTitle(ch)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Example Templates (Left) & JSON Editor (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: Subject-Specific JSON Examples & Guide (5 Cols) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-main uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-accent-1" />
                  <span>2. Reference Templates</span>
                </h3>
                <span className="text-[11px] text-muted">
                  Click tab to view format
                </span>
              </div>

              {/* Template Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-pill-bg border border-border rounded-xl">
                {["Science", "Urdu", "English", "Islamiyat", "Default"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveExampleTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeExampleTab === tab
                        ? "bg-card text-accent-1 shadow-xs border border-border"
                        : "text-muted hover:text-main"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Example Code Box */}
              <div className="relative flex-1 bg-pill-bg/50 border border-border rounded-2xl p-3 overflow-hidden flex flex-col min-h-[320px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                  <span className="text-[11px] font-bold text-muted flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{activeExampleTab} Template (MCQ, Short, Long)</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyExample(currentExampleCode)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-pill-bg text-[11px] font-bold text-main transition-colors cursor-pointer"
                      title="Copy example to clipboard"
                    >
                      {copiedExample ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedExample ? "Copied!" : "Copy"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadExampleIntoEditor(currentExampleCode)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-1 hover:bg-accent-1/90 text-[11px] font-bold text-white transition-colors cursor-pointer shadow-xs"
                      title="Insert this template into the JSON editor"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>

                <pre className="flex-1 font-mono text-[11px] text-muted overflow-auto custom-scrollbar p-1 leading-relaxed select-all">
                  {currentExampleCode}
                </pre>
              </div>

              {/* Quick Format Notes */}
              <div className="text-[11px] text-muted space-y-1 bg-pill-bg/30 border border-border/50 rounded-xl p-3">
                <p className="font-bold text-main">💡 Format Guidelines:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><code className="text-accent-1">topics</code>: topic number array e.g. <code className="font-mono">["1.1"]</code> (matches topic in chapter).</li>
                  <li><code className="text-accent-1">type</code>: <code className="font-mono">"MCQ"</code>, <code className="font-mono">"SHORT"</code>, or <code className="font-mono">"LONG"</code>.</li>
                  <li><code className="text-accent-1">options</code>: exactly 4 options for MCQs with one marked <code className="font-mono">"isCorrect": true</code>.</li>
                  <li>Math symbols: write as <code className="font-mono">$formula$</code> (click Auto-Fix to escape slashes).</li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: Large JSON Editor & Validator (7 Cols) */}
            <div className="lg:col-span-7 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-main uppercase tracking-wider">
                    3. JSON Questions Array
                  </h3>
                  {jsonValidation && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        jsonValidation.isValid
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {jsonValidation.isValid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {jsonValidation.total} Ready ({jsonValidation.mcqCount} MCQs, {jsonValidation.shortCount} Short, {jsonValidation.longCount} Long)
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Invalid JSON</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {jsonInput && (
                    <button
                      type="button"
                      onClick={handleApplyAutoFix}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition-all cursor-pointer"
                      title="Automatically fix single backslashes in LaTeX formulas"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Auto-Fix LaTeX</span>
                    </button>
                  )}
                  {jsonInput && (
                    <button
                      type="button"
                      onClick={() => setJsonInput("")}
                      className="text-xs font-bold text-muted hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Monospace JSON Editor Area */}
              <div className="relative flex-1">
                <textarea
                  rows="18"
                  placeholder={`[\n  {\n    "topics": ["1.1"],\n    "type": "MCQ",\n    "statement": { "en": "What is Force?", "ur": "فورس کیا ہے؟" },\n    "options": [\n      { "en": "Mass x Accel", "ur": "ماس x ایکسیلیریشن", "isCorrect": true },\n      { "en": "Velocity", "ur": "ویسلاسٹی", "isCorrect": false },\n      { "en": "Speed", "ur": "سپیڈ", "isCorrect": false },\n      { "en": "Energy", "ur": "انرجی", "isCorrect": false }\n    ]\n  },\n  {\n    "topics": ["1.2"],\n    "type": "SHORT",\n    "statement": { "en": "State Newton's First Law.", "ur": "نیوٹن کا پہلا قانون بیان کریں۔" }\n  }\n]`}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-full min-h-[380px] p-4 text-xs font-mono bg-card border border-border rounded-2xl text-main placeholder:text-muted focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/40 transition-all custom-scrollbar leading-relaxed"
                />
              </div>

              {jsonValidation && !jsonValidation.isValid && (
                <div className="text-[11px] font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                  {jsonValidation.message}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-between shrink-0">
            <div className="text-xs text-muted">
              {chapterTopics.length > 0 ? (
                <span>
                  Target Chapter: <strong className="text-main">{modalChapters.find((c) => c._id === chapterId)?.name?.en || modalChapters.find((c) => c._id === chapterId)?.chapterNumber || "Selected"}</strong>
                </span>
              ) : (
                <span>Select subject and chapter to enable upload</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-main bg-pill-bg hover:bg-pill-bg/80 border border-border transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={importing || !jsonInput.trim() || !chapterId}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-accent-1 hover:bg-accent-1/90 active:scale-98 shadow-md shadow-accent-1/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {importing && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>
                  {importing ? "Uploading Questions..." : "Upload Unified Questions Batch"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default BulkAddQuestionModal;
