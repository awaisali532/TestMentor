import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Tag,
  Repeat,
  HelpCircle,
} from "lucide-react";

const AddQuestionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  filtersData,
  saving,
  activeClass,
  activeSubject,
  activeChapter,
  activeTopic,
}) => {
  // Sticky Mode Toggle
  const [retainSelection, setRetainSelection] = useState(false);

  // Form Fields
  const [classLevel, setClassLevel] = useState("9th");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [type, setType] = useState("MCQ");

  // Multi-Select Categories Array
  const [selectedCategories, setSelectedCategories] = useState(["TEXT"]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [difficulty, setDifficulty] = useState("Medium");
  const [marks, setMarks] = useState(1);
  const [important, setImportant] = useState(false);

  // Statement & MCQ Options
  const [statementEn, setStatementEn] = useState("");
  const [statementUr, setStatementUr] = useState("");
  const [options, setOptions] = useState([
    { text: { en: "", ur: "" }, isCorrect: true },
    { text: { en: "", ur: "" }, isCorrect: false },
    { text: { en: "", ur: "" }, isCorrect: false },
    { text: { en: "", ur: "" }, isCorrect: false },
  ]);

  // Chapters & Topics for modal dropdowns
  const [modalChapters, setModalChapters] = useState([]);
  const [modalTopics, setModalTopics] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // 1. Auto Pre-Fill or Editing Populate
  useEffect(() => {
    if (initialData) {
      setClassLevel(initialData.classLevel || activeClass || "9th");
      setSubjectId(
        initialData.subject?._id || initialData.subject || activeSubject || ""
      );
      setChapterId(
        initialData.chapter?._id || initialData.chapter || activeChapter || ""
      );
      setTopicId(
        initialData.topics?.[0]?._id ||
          initialData.topics?.[0] ||
          activeTopic ||
          ""
      );
      setType(initialData.type || "MCQ");

      const cats = Array.isArray(initialData.questionCategory)
        ? initialData.questionCategory
        : [initialData.questionCategory || "TEXT"];
      setSelectedCategories(cats);

      setDifficulty(initialData.difficulty || "Medium");
      setMarks(initialData.marks || (initialData.type === "MCQ" ? 1 : 2));
      setImportant(!!initialData.important);
      setStatementEn(initialData.statement?.en || "");
      setStatementUr(initialData.statement?.ur || "");

      if (initialData.options && initialData.options.length > 0) {
        const formatted = initialData.options.map((opt) => ({
          text: {
            en: opt.text?.en || opt.en || "",
            ur: opt.text?.ur || opt.ur || "",
          },
          isCorrect: !!opt.isCorrect,
        }));
        setOptions(formatted);
      }
    } else {
      // New Question Auto-Pre-Fill from Filter Bar Context
      if (activeClass) setClassLevel(activeClass);
      if (activeSubject) setSubjectId(activeSubject);
      if (activeChapter) setChapterId(activeChapter);
      if (activeTopic) setTopicId(activeTopic);

      if (!retainSelection && !initialData) {
        setStatementEn("");
        setStatementUr("");
        setOptions([
          { text: { en: "", ur: "" }, isCorrect: true },
          { text: { en: "", ur: "" }, isCorrect: false },
          { text: { en: "", ur: "" }, isCorrect: false },
          { text: { en: "", ur: "" }, isCorrect: false },
        ]);
      }
    }
  }, [
    initialData,
    isOpen,
    activeClass,
    activeSubject,
    activeChapter,
    activeTopic,
    retainSelection,
  ]);

  // 2. Fetch Modal Chapters when subjectId changes
  useEffect(() => {
    if (!subjectId) {
      setModalChapters([]);
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
        console.error("Error fetching modal chapters:", err);
      }
    };
    fetchChapters();
  }, [subjectId, API_URL]);

  // 3. Fetch Modal Topics when chapterId changes
  useEffect(() => {
    if (!chapterId) {
      setModalTopics([]);
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
        setModalTopics(
          Array.isArray(res.data) ? res.data : res.data?.topics || []
        );
      } catch (err) {
        console.error("Error fetching modal topics:", err);
      }
    };
    fetchTopics();
  }, [chapterId, API_URL]);

  // 4. Fetch Subject-Specific Categories from Backend API Endpoint
  useEffect(() => {
    if (!subjectId) {
      setAvailableCategories([]);
      return;
    }
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/questions/categories?subjectId=${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const cats = res.data?.categories || [];
        setAvailableCategories(cats);

        // Ensure default selected categories are valid
        if (cats.length > 0) {
          const validValues = cats.map((c) => c.value);
          const filteredSel = selectedCategories.filter((sc) =>
            validValues.includes(sc)
          );
          if (filteredSel.length === 0) {
            setSelectedCategories([cats[0].value]);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [subjectId, API_URL]);

  // Filter subjects by selected Class
  const modalAvailableSubjects = useMemo(() => {
    const rawList = classLevel
      ? (filtersData?.subjects || []).filter(
          (s) =>
            String(s.className || "").toLowerCase().trim() ===
            String(classLevel).toLowerCase().trim()
        )
      : filtersData?.subjects || [];

    try {
      const clicks = JSON.parse(
        localStorage.getItem("qb_subject_clicks") || "{}"
      );
      return [...rawList].sort((a, b) => {
        const countA = clicks[a._id] || 0;
        const countB = clicks[b._id] || 0;
        return countB - countA;
      });
    } catch {
      return rawList;
    }
  }, [filtersData?.subjects, classLevel]);

  if (!isOpen) return null;

  // Toggle Category Selection
  const handleToggleCategory = (val) => {
    setSelectedCategories((prev) => {
      if (prev.includes(val)) {
        if (prev.length === 1) return prev; // Keep at least one category selected
        return prev.filter((item) => item !== val);
      } else {
        return [...prev, val];
      }
    });
  };

  // Option text change for MCQ
  const handleOptionTextChange = (index, lang, value) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        text: {
          ...updated[index].text,
          [lang]: value,
        },
      };
      return updated;
    });
  };

  // Set Correct Radio Option
  const handleSetCorrectOption = (index) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subjectId) return Swal.fire("Warning", "Please select a Subject!", "warning");
    if (!chapterId) return Swal.fire("Warning", "Please select a Chapter!", "warning");
    if (!topicId) return Swal.fire("Warning", "Please select a Topic!", "warning");

    // Statement Validation
    if (!statementEn.trim() && !statementUr.trim()) {
      return Swal.fire("Warning", "Question statement cannot be completely empty!", "warning");
    }

    // Compulsory Urdu rule for Class 9th & 10th
    if ((classLevel === "9th" || classLevel === "10th") && !statementUr.trim()) {
      return Swal.fire(
        "Urdu Compulsory",
        `Urdu statement is strictly mandatory for Class ${classLevel}!`,
        "warning"
      );
    }

    // MCQ Options Validation
    if (type === "MCQ") {
      const hasCorrect = options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        return Swal.fire("Warning", "Please mark at least one option as correct!", "warning");
      }

      for (let i = 0; i < 4; i++) {
        const enVal = options[i].text?.en?.trim() || "";
        const urVal = options[i].text?.ur?.trim() || "";
        if (!enVal && !urVal) {
          return Swal.fire(
            "Incomplete Options",
            `Option ${String.fromCharCode(65 + i)} is empty!`,
            "warning"
          );
        }
        if ((classLevel === "9th" || classLevel === "10th") && !urVal) {
          return Swal.fire(
            "Urdu Options Compulsory",
            `Option ${String.fromCharCode(65 + i)} (Urdu) is mandatory for ${classLevel}!`,
            "warning"
          );
        }
      }
    }

    const payload = {
      classLevel,
      subject: subjectId,
      chapter: chapterId,
      topics: [topicId],
      type,
      questionCategory: selectedCategories,
      difficulty,
      marks: Number(marks),
      important,
      statement: {
        en: statementEn.trim(),
        ur: statementUr.trim(),
      },
      options:
        type === "MCQ"
          ? options.map((opt) => ({
              en: opt.text.en.trim(),
              ur: opt.text.ur.trim(),
              isCorrect: opt.isCorrect,
            }))
          : [],
    };

    onSubmit(payload);

    // If Sticky Mode is ON and adding new question, clear statement but retain hierarchy
    if (retainSelection && !initialData) {
      setStatementEn("");
      setStatementUr("");
      setOptions([
        { text: { en: "", ur: "" }, isCorrect: true },
        { text: { en: "", ur: "" }, isCorrect: false },
        { text: { en: "", ur: "" }, isCorrect: false },
        { text: { en: "", ur: "" }, isCorrect: false },
      ]);
    }
  };

  const safeTitle = (item) => {
    if (!item) return "";
    if (typeof item.name === "string") return item.name;
    if (typeof item.name === "object") return item.name?.en || item.name?.ur || "";
    if (typeof item.title === "string") return item.title;
    if (typeof item.title === "object") return item.title?.en || item.title?.ur || "";
    return "";
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-4 animate-scale-up flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-pill-bg/60 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-accent-1/10 text-accent-1 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-main">
                {initialData ? "Edit Question" : "Add New Question"}
              </h2>
              <p className="text-xs text-muted">
                {initialData ? "Update question content and options" : "Add single question to the question bank"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sticky Mode Toggle Button */}
            {!initialData && (
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-accent-1 bg-accent-1/10 px-3 py-1.5 rounded-xl border border-accent-1/20 hover:bg-accent-1/15 transition-colors">
                <Repeat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Continuous Entry Mode</span>
                <input
                  type="checkbox"
                  checked={retainSelection}
                  onChange={(e) => setRetainSelection(e.target.checked)}
                  className="rounded border-border text-accent-1 focus:ring-accent-1 cursor-pointer"
                />
              </label>
            )}

            <button
              onClick={onClose}
              className="text-muted hover:text-main p-2 rounded-xl hover:bg-pill-bg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Section 1: Hierarchy & Classification */}
          <div className="bg-pill-bg/40 border border-border rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-main uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-1" />
              <span>1. Classification & Hierarchy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                    setTopicId("");
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
                    setTopicId("");
                  }}
                  required
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all cursor-pointer"
                >
                  <option value="">
                    {modalAvailableSubjects.length === 0
                      ? `No Subjects in Class ${classLevel}`
                      : "-- Select Subject --"}
                  </option>
                  {modalAvailableSubjects.map((s, i) => (
                    <option key={s._id || i} value={s._id}>
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
                  onChange={(e) => {
                    setChapterId(e.target.value);
                    setTopicId("");
                  }}
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

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Topic <span className="text-red-500">*</span>
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  required
                  disabled={!chapterId}
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <option value="">Select Topic</option>
                  {modalTopics.map((t, i) => (
                    <option key={t._id || i} value={t._id}>
                      {t.topicNumber ? `${t.topicNumber}: ` : ""}
                      {safeTitle(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Type, Difficulty, Marks & Multi-Select Categories */}
          <div className="bg-pill-bg/40 border border-border rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-main uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent-1" />
              <span>2. Question Format & Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setType(newType);
                    if (newType === "MCQ") setMarks(1);
                    else if (newType === "SHORT") setMarks(2);
                    else setMarks(5);
                  }}
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all cursor-pointer"
                >
                  <option value="MCQ">Multiple Choice Question (MCQ)</option>
                  <option value="SHORT">Short Question</option>
                  <option value="LONG">Long Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Marks
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full text-xs font-bold bg-card border border-border rounded-xl px-3 py-2.5 text-main focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all"
                />
              </div>
            </div>

            {/* Subject-Specific Categories */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-muted uppercase">
                  Subject Categories (Multi-Select) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-muted">
                  Click to toggle tags
                </span>
              </div>

              {loadingCategories ? (
                <div className="text-xs text-muted p-3 animate-pulse bg-card border border-border rounded-xl">
                  Loading categories for subject...
                </div>
              ) : availableCategories.length === 0 ? (
                <div className="text-xs text-muted italic p-3 bg-card border border-border rounded-xl">
                  Select a subject to view allowed categories.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 bg-card border border-border rounded-xl custom-scrollbar">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.value);
                    return (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => handleToggleCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-accent-1 text-white shadow-xs"
                            : "bg-pill-bg border border-border text-muted hover:text-main hover:border-slate-400"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Question Statements (Dual Medium) */}
          <div className="bg-pill-bg/40 border border-border rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-main uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-1" />
              <span>3. Question Statements</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase">
                  Statement (English)
                </label>
                <textarea
                  rows="4"
                  placeholder="Enter English question text..."
                  value={statementEn}
                  onChange={(e) => setStatementEn(e.target.value)}
                  className="w-full text-xs font-medium bg-card border border-border rounded-xl p-3 text-main placeholder:text-muted focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all resize-y"
                ></textarea>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-muted uppercase">
                    سوال کا متن (Urdu Statement)
                  </label>
                  {(classLevel === "9th" || classLevel === "10th") && (
                    <span className="text-[10px] font-extrabold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                      * Compulsory for {classLevel}
                    </span>
                  )}
                </div>
                <textarea
                  rows="4"
                  dir="rtl"
                  placeholder="اردو سوال یہاں درج کریں..."
                  value={statementUr}
                  onChange={(e) => setStatementUr(e.target.value)}
                  className="w-full text-sm font-medium bg-card border border-border rounded-xl p-3 text-main font-urdu placeholder:text-muted focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all resize-y leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 4: MCQ Options (If Type === MCQ) */}
          {type === "MCQ" && (
            <div className="bg-pill-bg/40 border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-main uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-1" />
                  <span>4. MCQ Options (Select Correct Answer)</span>
                </h3>

                {(classLevel === "9th" || classLevel === "10th") && (
                  <span className="text-[10px] font-extrabold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                    * Urdu Options Compulsory for {classLevel}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      opt.isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20"
                        : "bg-card border-border hover:border-slate-400 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-extrabold text-main">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrectOption(i)}
                          className="text-accent-1 focus:ring-accent-1 cursor-pointer"
                        />
                        <span>Option {String.fromCharCode(65 + i)}</span>
                        {opt.isCorrect && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-extrabold">
                            Correct Answer
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + i)} (English)`}
                        value={opt.text?.en || opt.en || ""}
                        onChange={(e) =>
                          handleOptionTextChange(i, "en", e.target.value)
                        }
                        className="w-full text-xs font-semibold bg-pill-bg border border-border rounded-xl px-3.5 py-2 text-main placeholder:text-muted focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={`آپشن ${String.fromCharCode(65 + i)} (اردو)`}
                        value={opt.text?.ur || opt.ur || ""}
                        onChange={(e) =>
                          handleOptionTextChange(i, "ur", e.target.value)
                        }
                        className="w-full text-xs font-semibold bg-pill-bg border border-border rounded-xl px-3.5 py-2 text-main font-urdu placeholder:text-muted focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1/30 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-main bg-pill-bg hover:bg-pill-bg/80 border border-border transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-accent-1 hover:bg-accent-1/90 active:scale-98 shadow-md shadow-accent-1/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {initialData
                  ? "Update Question"
                  : retainSelection
                  ? "Save & Add Next"
                  : "Save Question"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddQuestionModal;
