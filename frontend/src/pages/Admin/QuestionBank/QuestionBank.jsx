import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { HelpCircle, Filter, ArrowUp } from "lucide-react";

import Loader from "../../../components/ui/Loader";

// Modular Components
import QuestionBankHeader from "./components/QuestionBankHeader";
import QuestionFilterBar from "./components/QuestionFilterBar";
import QuestionList from "./components/QuestionList";
import AddQuestionModal from "./components/AddQuestionModal";
import BulkAddQuestionModal from "./components/BulkAddQuestionModal";
import BulkActionsBar from "./components/BulkActionsBar";

const TTL_MS = 30 * 60 * 1000; // 30 Minutes Cache Expiry

const isCacheValid = () => {
  const cacheTime = sessionStorage.getItem("qb_cacheTime");
  if (!cacheTime) return false;
  return Date.now() - Number(cacheTime) < TTL_MS;
};

const QuestionBank = () => {
  // All Subjects from Backend
  const [allSubjects, setAllSubjects] = useState([]);

  // Master Questions Cache for Currently Loaded Class + Subject (Restored from sessionStorage if valid)
  const [masterQuestions, setMasterQuestions] = useState(() => {
    if (isCacheValid()) {
      try {
        const cached = sessionStorage.getItem("qb_masterQuestions");
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [loadedClassSubject, setLoadedClassSubject] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_loadedKey") || "" : "";
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Selected Filter States (Restored from sessionStorage if valid)
  const [selectedClass, setSelectedClass] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_selectedClass") || "" : "";
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_selectedSubject") || "" : "";
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_selectedChapter") || "" : "";
  });
  const [selectedTopic, setSelectedTopic] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_selectedTopic") || "" : "";
  });
  const [selectedType, setSelectedType] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_selectedType") || "" : "";
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(() => {
    if (isCacheValid()) {
      try {
        const cached = sessionStorage.getItem("qb_selectedCategoryFilter");
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return isCacheValid() ? sessionStorage.getItem("qb_searchQuery") || "" : "";
  });

  // Modals & Selection
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Sync state & masterQuestions to sessionStorage on any filter/question change
  useEffect(() => {
    if (selectedClass || selectedSubject || masterQuestions.length > 0) {
      sessionStorage.setItem("qb_selectedClass", selectedClass);
      sessionStorage.setItem("qb_selectedSubject", selectedSubject);
      sessionStorage.setItem("qb_selectedChapter", selectedChapter);
      sessionStorage.setItem("qb_selectedTopic", selectedTopic);
      sessionStorage.setItem("qb_selectedType", selectedType);
      sessionStorage.setItem(
        "qb_selectedCategoryFilter",
        JSON.stringify(selectedCategoryFilter)
      );
      sessionStorage.setItem("qb_searchQuery", searchQuery);
      sessionStorage.setItem("qb_loadedKey", loadedClassSubject);
      sessionStorage.setItem("qb_cacheTime", Date.now().toString());

      try {
        sessionStorage.setItem(
          "qb_masterQuestions",
          JSON.stringify(masterQuestions)
        );
      } catch (e) {
        console.warn("sessionStorage size limit reached", e);
      }
    }
  }, [
    selectedClass,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    selectedType,
    selectedCategoryFilter,
    searchQuery,
    loadedClassSubject,
    masterQuestions,
  ]);

  // ── Enable scrollbar on this page only ──────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.add("qbank-page");
    return () => {
      document.documentElement.classList.remove("qbank-page");
    };
  }, []);

  // 1. Fetch All Subjects on Initial Page Mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllSubjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, [API_URL]);

  // 2. Fetch Master Questions from Backend ONLY when Class + Subject is selected and not cached
  const fetchMasterQuestions = useCallback(
    async (force = false) => {
      if (!selectedClass || !selectedSubject) {
        setMasterQuestions([]);
        setLoadedClassSubject("");
        return;
      }

      const key = `${selectedClass}_${selectedSubject}`;
      if (!force && loadedClassSubject === key && masterQuestions.length > 0) {
        // Already loaded & cached in memory for this Class + Subject
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const payload = {
          classLevel: selectedClass,
          subject: selectedSubject,
        };

        const res = await axios.post(`${API_URL}/questions/filter`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.questions || res.data?.data || [];

        setMasterQuestions(list);
        setLoadedClassSubject(key);
      } catch (err) {
        console.error("Error fetching master questions:", err);
        setMasterQuestions([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_URL, selectedClass, selectedSubject, loadedClassSubject, masterQuestions.length]
  );

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      const key = `${selectedClass}_${selectedSubject}`;
      if (loadedClassSubject !== key || masterQuestions.length === 0) {
        fetchMasterQuestions(false);
      }
    }
  }, [selectedClass, selectedSubject, loadedClassSubject, masterQuestions.length, fetchMasterQuestions]);

  // 3. ZERO BACKEND CALLS: In-Memory Fast Filtering (0ms Latency)
  const filteredQuestions = useMemo(() => {
    if (!masterQuestions || masterQuestions.length === 0) return [];

    return masterQuestions.filter((q) => {
      // Chapter Filter
      if (selectedChapter) {
        const chId = q.chapter?._id || q.chapter;
        if (chId !== selectedChapter) return false;
      }

      // Topic Filter
      if (selectedTopic) {
        const topIds = Array.isArray(q.topics)
          ? q.topics.map((t) => t._id || t)
          : [q.topics?._id || q.topics];
        if (!topIds.includes(selectedTopic)) return false;
      }

      // Type Filter (MCQ, SHORT, LONG)
      if (selectedType && selectedType !== "") {
        if (q.type !== selectedType) return false;
      }

      // Category Filter (Strict AND Match - Question must contain ALL selected categories)
      if (selectedCategoryFilter && selectedCategoryFilter.length > 0) {
        const qCats = Array.isArray(q.questionCategory)
          ? q.questionCategory
          : [q.questionCategory];
        const matchesAllCategories = selectedCategoryFilter.every((sc) =>
          qCats.includes(sc)
        );
        if (!matchesAllCategories) return false;
      }

      // Search Query (English or Urdu)
      if (searchQuery && searchQuery.trim()) {
        const term = searchQuery.toLowerCase().trim();
        const enMatch = q.statement?.en?.toLowerCase().includes(term);
        const urMatch = q.statement?.ur?.toLowerCase().includes(term);
        if (!enMatch && !urMatch) return false;
      }

      return true;
    });
  }, [
    masterQuestions,
    selectedChapter,
    selectedTopic,
    selectedType,
    selectedCategoryFilter,
    searchQuery,
  ]);

  // Compute Live Header Counts from Master Data
  const counts = useMemo(() => {
    return {
      total: masterQuestions.length,
      mcq: masterQuestions.filter((q) => q.type === "MCQ").length,
      short: masterQuestions.filter((q) => q.type === "SHORT").length,
      long: masterQuestions.filter((q) => q.type === "LONG").length,
    };
  }, [masterQuestions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMasterQuestions(true);
  };

  const handleResetFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");
    setSelectedType("");
    setSelectedCategoryFilter([]);
    setSearchQuery("");
    setMasterQuestions([]);
    setLoadedClassSubject("");
    setSelectedIds([]);

    sessionStorage.removeItem("qb_selectedClass");
    sessionStorage.removeItem("qb_selectedSubject");
    sessionStorage.removeItem("qb_selectedChapter");
    sessionStorage.removeItem("qb_selectedTopic");
    sessionStorage.removeItem("qb_selectedType");
    sessionStorage.removeItem("qb_selectedCategoryFilter");
    sessionStorage.removeItem("qb_searchQuery");
    sessionStorage.removeItem("qb_loadedKey");
    sessionStorage.removeItem("qb_masterQuestions");
    sessionStorage.removeItem("qb_cacheTime");
  };

  // Selection Logic
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q._id));
    }
  };

  // Instant Optimistic In-Memory Save / Edit Handler (0ms Delay)
  const handleSaveQuestion = async (payload) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (editingQuestion) {
        // 1. Edit existing question
        const res = await axios.put(
          `${API_URL}/questions/${editingQuestion._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updatedDoc = res.data?.question || res.data || {};
        const mergedQuestion = {
          ...editingQuestion,
          ...payload,
          ...updatedDoc,
          subject:
            updatedDoc.subject && typeof updatedDoc.subject === "object"
              ? updatedDoc.subject
              : editingQuestion.subject,
          chapter:
            updatedDoc.chapter && typeof updatedDoc.chapter === "object"
              ? updatedDoc.chapter
              : editingQuestion.chapter,
          topics:
            Array.isArray(updatedDoc.topics) &&
            updatedDoc.topics.length > 0 &&
            typeof updatedDoc.topics[0] === "object"
              ? updatedDoc.topics
              : editingQuestion.topics,
        };

        // Instant In-Memory State Update (0ms)
        setMasterQuestions((prev) =>
          prev.map((q) =>
            q._id === editingQuestion._id ? mergedQuestion : q
          )
        );

        Swal.fire("Updated!", "Question updated successfully.", "success");
        setIsAddModalOpen(false);
        setEditingQuestion(null);
      } else {
        // 2. Add new question
        const res = await axios.post(`${API_URL}/questions/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newDoc = res.data?.question || res.data || { _id: Date.now().toString(), ...payload };

        // Instant Prepend In-Memory (0ms)
        setMasterQuestions((prev) => [newDoc, ...prev]);

        if (payload.retainSelection) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Question Saved! Ready for next question.",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          Swal.fire("Created!", "New question added to bank.", "success");
          setIsAddModalOpen(false);
          setEditingQuestion(null);
        }
      }
    } catch (err) {
      console.error("Error saving question:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save question.";
      Swal.fire("Error!", errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Instant Single Delete with Site-Wide UI Loader
  const handleDeleteQuestion = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This question will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#dc2626",
    });

    if (confirm.isConfirmed) {
      try {
        setActionLoading("Deleting Question...");
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Instant In-Memory Removal (0ms)
        setMasterQuestions((prev) => prev.filter((q) => q._id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));

        setActionLoading(null);
        Swal.fire("Deleted!", "Question deleted successfully.", "success");
      } catch (err) {
        console.error("Error deleting question:", err);
        setActionLoading(null);
        Swal.fire("Error!", "Failed to delete question.", "error");
      }
    }
  };

  // Instant Bulk Delete with Site-Wide UI Loader
  const handleDeleteBulk = async () => {
    const confirm = await Swal.fire({
      title: `Delete ${selectedIds.length} Questions?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete selected!",
      confirmButtonColor: "#dc2626",
    });

    if (confirm.isConfirmed) {
      try {
        setActionLoading(`Deleting ${selectedIds.length} Questions...`);
        const token = localStorage.getItem("token");
        await axios.post(
          `${API_URL}/questions/delete-bulk`,
          { ids: selectedIds },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Instant In-Memory Removal (0ms)
        setMasterQuestions((prev) =>
          prev.filter((q) => !selectedIds.includes(q._id))
        );
        setSelectedIds([]);

        setActionLoading(null);
        Swal.fire("Deleted!", "Selected questions deleted successfully.", "success");
      } catch (err) {
        console.error("Error deleting questions bulk:", err);
        setActionLoading(null);
        Swal.fire("Error!", "Failed to bulk delete questions.", "error");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 show-scrollbar">
      {/* Non-Blocking Top Background Progress Bar when fetching data */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-emerald-600 animate-pulse w-full"></div>
        </div>
      )}

      {/* 1. Header & Stats Bar (Stable & Freeze) */}
      <QuestionBankHeader
        counts={counts}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onOpenAddModal={() => {
          setEditingQuestion(null);
          setIsAddModalOpen(true);
        }}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
      />

      {/* 2. Cascading Filters & Search Bar */}
      <QuestionFilterBar
        allSubjects={allSubjects}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* Action FullScreen Site-Wide Loader */}
      {actionLoading && <Loader text={actionLoading} fullScreen={true} />}

      {/* 3. Conditional Content View */}
      {!selectedClass || !selectedSubject ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Filter className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-main">
              Select Class & Subject to View Questions
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Please choose a <span className="font-semibold text-emerald-600">Class Level</span> and <span className="font-semibold text-emerald-600">Subject</span> from the filter bar above to load questions.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUp className="w-4 h-4 animate-bounce" />
            <span>Select from filter bar above</span>
          </div>
        </div>
      ) : (
        /* 4. Questions List Container (Refreshes without flickering header) */
        <QuestionList
          questions={filteredQuestions}
          loading={loading}
          selectedIds={selectedIds}
          selectedChapter={selectedChapter}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onEdit={(q) => {
            setEditingQuestion(q);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteQuestion}
        />
      )}

      {/* 5. Add / Edit Question Modal */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={handleSaveQuestion}
        initialData={editingQuestion}
        filtersData={{ subjects: allSubjects }}
        saving={saving}
        activeClass={selectedClass}
        activeSubject={selectedSubject}
        activeChapter={selectedChapter}
        activeTopic={selectedTopic}
      />

      {/* 6. Bulk Add Questions Modal */}
      <BulkAddQuestionModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        allSubjects={allSubjects}
        activeClass={selectedClass}
        activeSubject={selectedSubject}
        activeChapter={selectedChapter}
        activeTopic={selectedTopic}
        onSuccess={() => fetchMasterQuestions(true)}
      />

      {/* 7. Floating Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onDeleteBulk={handleDeleteBulk}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
};

export default QuestionBank;
