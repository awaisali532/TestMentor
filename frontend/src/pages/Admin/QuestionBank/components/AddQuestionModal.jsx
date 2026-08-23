import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Tag,
  Repeat,
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

  // Filter subjects by selected Class and sort by click popularity
  const modalAvailableSubjects = React.useMemo(() => {
    const rawList = classLevel
      ? (filtersData?.subjects || []).filter(
          (s) =>
            s.className?.toLowerCase().trim() ===
            classLevel.toLowerCase().trim()
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
    } catch (e) {
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

  const handleOptionTextChange = (index, lang, value) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === index
          ? { ...opt, text: { ...opt.text, [lang]: value } }
          : opt
      )
    );
  };

  const handleSetCorrectOption = (index) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, isCorrect: i === index }))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Hierarchy Validations
    if (!subjectId) {
      Swal.fire("Missing Subject", "Please select a Subject.", "warning");
      return;
    }
    if (!chapterId) {
      Swal.fire("Missing Chapter", "Please select a Chapter.", "warning");
      return;
    }
    if (!topicId) {
      Swal.fire("Missing Topic", "Please select a Topic.", "warning");
      return;
    }

    // 2. English Statement Validation
    if (!statementEn || !statementEn.trim()) {
      Swal.fire(
        "Missing English Statement",
        "Please enter the English Question Statement.",
        "warning"
      );
      return;
    }

    // 3. Robust Compulsory Urdu Validation for Class 9th & 10th
    const normClass = String(classLevel || "").toLowerCase().trim();
    const isCompulsoryUrdu =
      normClass.includes("9") || normClass.includes("10");

    if (isCompulsoryUrdu) {
      if (!statementUr || !statementUr.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Urdu Statement Required!",
          text: `For Class ${classLevel || "9th/10th"}, Urdu Question Statement is mandatory.`,
        });
        return;
      }

      if (type === "MCQ") {
        const hasEmptyUrduOption = options.some((opt) => {
          const urText = opt.text?.ur || opt.ur || "";
          return !urText.trim();
        });

        if (hasEmptyUrduOption) {
          Swal.fire({
            icon: "warning",
            title: "Urdu MCQ Options Required!",
            text: `For Class ${classLevel || "9th/10th"}, all MCQ Urdu Options (A, B, C, D) are mandatory.`,
          });
          return;
        }
      }
    }

    const payload = {
      retainSelection: retainSelection && !initialData,
      classLevel,
      subject: subjectId,
      chapter: chapterId,
      topics: [topicId],
      type,
      questionCategory: selectedCategories,
      difficulty,
      marks: Number(marks),
      important,
      statement: { en: statementEn, ur: statementUr },
      options:
        type === "MCQ"
          ? options.map((opt) => ({
              en: opt.text?.en || opt.en || "",
              ur: opt.text?.ur || opt.ur || "",
              isCorrect: !!opt.isCorrect,
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-main">
              {initialData ? "Edit Question" : "Add New Question"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Sticky Mode Toggle Button */}
            {!initialData && (
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <Repeat className="w-3.5 h-3.5" />
                <span>Retain Selection (Continuous Entry)</span>
                <input
                  type="checkbox"
                  checked={retainSelection}
                  onChange={(e) => setRetainSelection(e.target.checked)}
                  className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            )}

            <button
              onClick={onClose}
              className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Section 1: Hierarchy & Classification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              1. Classification & Hierarchy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Class Level *
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="9th">Class 9th</option>
                  <option value="10th">Class 10th</option>
                  <option value="11th">Class 11th</option>
                  <option value="12th">Class 12th</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="">
                    {modalAvailableSubjects.length === 0
                      ? `No Subjects in Class ${classLevel}`
                      : "-- Select Subject --"}
                  </option>
                  {modalAvailableSubjects.map((s, i) => (
                    <option key={s._id || i} value={s._id}>
                      {i === 0 ? "⭐ " : ""}
                      {s.subjectName} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter *
                </label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  required
                  disabled={!subjectId}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50 shadow-2xs"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic *
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  required
                  disabled={!chapterId}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50 shadow-2xs"
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

          {/* Section 2: Type, Difficulties & Multi-Select Categories */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              2. Question Type & Categories
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Format *
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === "MCQ") setMarks(1);
                    else if (e.target.value === "SHORT") setMarks(2);
                    else setMarks(5);
                  }}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="SHORT">Short Question</option>
                  <option value="LONG">Long / Detailed Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Backend Subject-Specific Multi-Select Category Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Categories for Selected Subject (Select Multi) *
              </label>
              {loadingCategories ? (
                <div className="text-xs text-muted animate-pulse">
                  Loading categories for subject...
                </div>
              ) : availableCategories.length === 0 ? (
                <div className="text-xs text-muted italic">
                  Select a subject to view allowed categories.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-300 dark:border-slate-700">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.value);
                    return (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => handleToggleCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-900"
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
          <div className="space-y-3 pt-3 border-t border-border/60">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              3. Question Statements (English & Urdu)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Statement (English)
                </label>
                <textarea
                  rows="5"
                  placeholder="Enter English question text..."
                  value={statementEn}
                  onChange={(e) => setStatementEn(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-right">
                  <span>سوال (Urdu Statement)</span>
                  {(classLevel === "9th" || classLevel === "10th") && (
                    <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      * Compulsory for {classLevel}
                    </span>
                  )}
                </label>
                <textarea
                  rows="5"
                  dir="rtl"
                  placeholder="اردو سوال درج کریں..."
                  value={statementUr}
                  onChange={(e) => setStatementUr(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-urdu shadow-2xs resize-y"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 4: MCQ Options (If Type === MCQ) */}
          {type === "MCQ" && (
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  4. MCQ Options (Select Correct Answer)
                </h3>

                {(classLevel === "9th" || classLevel === "10th") && (
                  <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                    * All Urdu Options Compulsory for {classLevel}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border transition-all ${
                      opt.isCorrect
                        ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-800"
                        : "bg-white dark:bg-slate-800/40 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-slate-100">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrectOption(i)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Option {String.fromCharCode(65 + i)}</span>
                        {opt.isCorrect && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Correct Answer
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + i)} (English)`}
                        value={opt.text?.en || opt.en || ""}
                        onChange={(e) =>
                          handleOptionTextChange(i, "en", e.target.value)
                        }
                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={`آپشن ${String.fromCharCode(65 + i)} (Urdu)`}
                        value={opt.text?.ur || opt.ur || ""}
                        onChange={(e) =>
                          handleOptionTextChange(i, "ur", e.target.value)
                        }
                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-urdu shadow-2xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-main bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
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
    </div>
  );
};

export default AddQuestionModal;
