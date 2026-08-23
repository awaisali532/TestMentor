import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { X, Zap, Layers, FileText, CheckCircle2 } from "lucide-react";

const BulkAddQuestionModal = ({
  isOpen,
  onClose,
  allSubjects,
  activeClass,
  activeSubject,
  activeChapter,
  activeTopic,
  onSuccess,
}) => {
  const [classLevel, setClassLevel] = useState("9th");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");

  const [questionType, setQuestionType] = useState("MCQ");
  const [bulkText, setBulkText] = useState("");
  const [importing, setImporting] = useState(false);

  const [modalChapters, setModalChapters] = useState([]);
  const [modalTopics, setModalTopics] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Pre-fill active selection
  useEffect(() => {
    if (isOpen) {
      if (activeClass) setClassLevel(activeClass);
      if (activeSubject) setSubjectId(activeSubject);
      if (activeChapter) setChapterId(activeChapter);
      if (activeTopic) setTopicId(activeTopic);
    }
  }, [isOpen, activeClass, activeSubject, activeChapter, activeTopic]);

  // Fetch Chapters
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
        console.error("Error fetching chapters:", err);
      }
    };
    fetchChapters();
  }, [subjectId, API_URL]);

  // Fetch Topics
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
        console.error("Error fetching topics:", err);
      }
    };
    fetchTopics();
  }, [chapterId, API_URL]);

  if (!isOpen) return null;

  const availableSubjects = classLevel
    ? allSubjects.filter(
        (s) =>
          s.className?.toLowerCase().trim() === classLevel.toLowerCase().trim()
      )
    : allSubjects;

  const safeTitle = (item) => {
    if (!item) return "";
    if (typeof item.name === "string") return item.name;
    if (typeof item.name === "object") return item.name?.en || item.name?.ur || "";
    if (typeof item.title === "string") return item.title;
    if (typeof item.title === "object") return item.title?.en || item.title?.ur || "";
    return "";
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!bulkText.trim()) {
      Swal.fire("Warning", "Please enter question statements.", "warning");
      return;
    }

    try {
      setImporting(true);
      const token = localStorage.getItem("token");

      // Parse lines or JSON blocks
      let parsedQuestions = [];
      try {
        // Try parsing JSON array
        const json = JSON.parse(bulkText);
        if (Array.isArray(json)) {
          parsedQuestions = json.map((q) => ({
            classLevel,
            subject: subjectId,
            chapter: chapterId,
            topics: [topicId],
            type: q.type || questionType,
            questionCategory: Array.isArray(q.questionCategory)
              ? q.questionCategory
              : [q.questionCategory || "EXERCISE"],
            difficulty: q.difficulty || "Medium",
            marks: q.marks || (questionType === "MCQ" ? 1 : 2),
            statement: {
              en: q.statement?.en || q.statementEn || (typeof q.statement === "string" ? q.statement : ""),
              ur: q.statement?.ur || q.statementUr || "",
            },
            options: q.options || [],
          }));
        }
      } catch (e) {
        // Line-by-line fallback parsing
        const lines = bulkText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        parsedQuestions = lines.map((line) => ({
          classLevel,
          subject: subjectId,
          chapter: chapterId,
          topics: [topicId],
          type: questionType,
          questionCategory: ["EXERCISE"],
          difficulty: "Medium",
          marks: questionType === "MCQ" ? 1 : questionType === "SHORT" ? 2 : 5,
          statement: { en: line, ur: "" },
          options:
            questionType === "MCQ"
              ? [
                  { text: { en: "Option A", ur: "" }, isCorrect: true },
                  { text: { en: "Option B", ur: "" }, isCorrect: false },
                  { text: { en: "Option C", ur: "" }, isCorrect: false },
                  { text: { en: "Option D", ur: "" }, isCorrect: false },
                ]
              : [],
        }));
      }

      if (parsedQuestions.length === 0) {
        Swal.fire("Error", "No valid questions parsed.", "error");
        return;
      }

      // Send to backend batch endpoint
      await axios.post(
        `${API_URL}/questions/bulk-add`,
        { questions: parsedQuestions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire(
        "Imported!",
        `Successfully imported ${parsedQuestions.length} questions into the bank.`,
        "success"
      );

      setBulkText("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Bulk add error:", err);
      Swal.fire("Error", "Failed to bulk import questions.", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-main">
              Bulk Import Questions
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBulkSubmit} className="p-6 space-y-5">
          {/* Target Classification */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Target Classification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class *
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => {
                    setClassLevel(e.target.value);
                    setSubjectId("");
                    setChapterId("");
                    setTopicId("");
                  }}
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
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId("");
                    setTopicId("");
                  }}
                  required
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
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
                  onChange={(e) => {
                    setChapterId(e.target.value);
                    setTopicId("");
                  }}
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
                      {safeTitle(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bulk Format Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
            >
              <option value="MCQ">Multiple Choice Questions (MCQ)</option>
              <option value="SHORT">Short Questions</option>
              <option value="LONG">Long Questions</option>
            </select>
          </div>

          {/* Bulk Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Paste Questions (Line-by-Line or JSON Array) *
              </label>
            </div>
            <textarea
              rows="8"
              placeholder={`Enter line-by-line questions or JSON format:\nExample Line 1: What is the SI unit of Force?\nExample Line 2: Define Speed and Velocity.`}
              value={bulkText}
              required
              className="w-full text-xs font-mono p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
            ></textarea>
            <p className="text-[11px] text-muted">
              Paste questions line-by-line or raw JSON array. Each line will create a question entry in the chosen chapter/topic.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-main bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={importing}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {importing && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Import Questions Batch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAddQuestionModal;
