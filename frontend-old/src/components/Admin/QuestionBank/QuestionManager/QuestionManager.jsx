import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "./QuestionManager.css";

// Components
import TMLoader from "../../../../components/common/TMLoader/TMLoader";
import ConfirmationModal from "../../../../components/common/ConfirmationModal/ConfirmationModal";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";

// Config & Utils
import { getCategoriesForSubject } from "../../../../config/SubjectConfig";
import { filterQuestionsLogic } from "../../../../utils/questionFilters"; // ✅ IMPORT NEW UTILITY

const QuestionManager = ({ chapterId, subjectId, classLevel }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // STATES
  const [subjectName, setSubjectName] = useState("Default");
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Filters
  const [filterTopicId, setFilterTopicId] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTypes, setFilterTypes] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("single");
  const [editingId, setEditingId] = useState(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
  });

  // Image Logic
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const isUrduSubject = [
    "Urdu",
    "Islamiyat",
    "Pak Study",
    "Tarjama",
    "Arabic",
    "History",
  ].some((s) => subjectName.includes(s));

  // Form Data
  const initialFormState = {
    selectedTopicIds: [],
    type: "MCQ",
    questionCategory: [],
    difficulty: "Medium",
    marks: 1,
    important: false,
    boardTags: "",
    statement: { en: "", ur: "" },
    questionData: { poetName: { en: "", ur: "" }, itemA: "", itemB: "" },
    options: [
      { en: "", ur: "", isCorrect: true },
      { en: "", ur: "", isCorrect: false },
      { en: "", ur: "", isCorrect: false },
      { en: "", ur: "", isCorrect: false },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  // INITIAL LOAD
  useEffect(() => {
    if (chapterId && subjectId) {
      fetchTopics();
      fetchSubjectDetails();
    }
  }, [chapterId, subjectId]);

  // FETCH QUESTIONS ON TOPIC/CHAPTER CHANGE
  useEffect(() => {
    if (chapterId) {
      fetchQuestions();
      setSelectedQuestionIds([]);
      setFilterCategory("");
      setFilterTypes([]);
    }
  }, [filterTopicId, chapterId]);

  // ==========================================
  // ✅ CLEANED UP FILTER LOGIC
  // ==========================================
  const filteredQuestions = useMemo(() => {
    return filterQuestionsLogic(questions, {
      topicId: filterTopicId,
      category: filterCategory,
      types: filterTypes,
    });
  }, [questions, filterTopicId, filterCategory, filterTypes]);

  // API CALLS
  const fetchSubjectDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects/${subjectId}`);
      if (res.data.subjectName) {
        setSubjectName(res.data.subjectName);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/topics/chapter/${chapterId}`,
      );
      if (Array.isArray(res.data)) setTopics(res.data);
      else if (Array.isArray(res.data.data)) setTopics(res.data.data);
      else setTopics([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topics");
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      let url;
      if (filterTopicId) {
        url = `${BASE_URL}/api/questions/topic/${filterTopicId}`;
      } else {
        url = `${BASE_URL}/api/questions/chapter/${chapterId}`;
      }

      const res = await axios.get(url);

      const typePriority = { MCQ: 1, SHORT: 2, LONG: 3 };
      const sortedData = res.data.sort((a, b) => {
        const topicA = a.topics?.[0]?.topicNumber || "0";
        const topicB = b.topics?.[0]?.topicNumber || "0";

        if (!filterTopicId && topicA !== topicB) {
          return topicA.localeCompare(topicB, undefined, { numeric: true });
        }

        const typeDiff =
          (typePriority[a.type] || 99) - (typePriority[b.type] || 99);

        return typeDiff === 0
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : typeDiff;
      });

      setQuestions(sortedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Baki sare Handlers Same Rahenge - No Change Needed) ...
  // Image Handlers, Edit Handlers, Delete Handlers, Submit Handlers...

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setRemoveImageFlag(false);
    }
  };
  const clearImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    setRemoveImageFlag(true);
  };

  const handleEdit = (question) => {
    setEditingId(question._id);
    setMode("single");
    setRemoveImageFlag(false);

    let catArray = [];
    if (Array.isArray(question.questionCategory)) {
      catArray = question.questionCategory;
    } else if (question.questionCategory) {
      catArray = [question.questionCategory];
    }

    setFormData({
      selectedTopicIds: question.topics || [],
      type: question.type,
      questionCategory: catArray,
      difficulty: question.difficulty,
      marks: question.marks,
      important: question.important || false,
      statement: {
        en: question.statement?.en || "",
        ur: question.statement?.ur || "",
      },
      questionData: question.questionData || initialFormState.questionData,
      options:
        question.options.length > 0
          ? question.options
          : initialFormState.options,
      boardTags: Array.isArray(question.boardTags)
        ? question.boardTags.join(", ")
        : "",
    });
    if (question.image && question.image.url) {
      setPreviewImage(question.image.url);
    } else {
      setPreviewImage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setImageFile(null);
    setPreviewImage(null);
    setRemoveImageFlag(false);
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId],
    );
  };

  const handleDelete = (id) =>
    setDeleteModal({
      isOpen: true,
      type: "SINGLE",
      id,
      title: "Delete?",
      message: "Sure?",
    });
  const handleDeleteSelected = () => {
    if (selectedQuestionIds.length > 0)
      setDeleteModal({
        isOpen: true,
        type: "BULK",
        title: "Delete Selected?",
        message: "Sure?",
      });
  };
  const handleDeleteAllInTopic = () => {
    if (filterTopicId)
      setDeleteModal({
        isOpen: true,
        type: "ALL_TOPIC",
        title: "Delete ALL?",
        message: "Sure?",
      });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal({ ...deleteModal, isOpen: false });
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      if (deleteModal.type === "SINGLE") {
        await axios.delete(`${BASE_URL}/api/questions/${deleteModal.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deleted");
      } else if (deleteModal.type === "BULK") {
        await axios.post(
          `${BASE_URL}/api/questions/delete-bulk`,
          { ids: selectedQuestionIds },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.success("Deleted");
        setSelectedQuestionIds([]);
      } else if (deleteModal.type === "ALL_TOPIC") {
        await axios.delete(
          `${BASE_URL}/api/questions/topic/${filterTopicId}/delete-all`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.success("Cleared");
        setSelectedQuestionIds([]);
      }
      fetchQuestions();
    } catch (err) {
      Swal.fire("Error", "Failed to delete", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === "MCQ") {
      const filled = formData.options.filter((opt) =>
        isUrduSubject ? opt.ur?.trim() : opt.en?.trim() || opt.ur?.trim(),
      );
      if (filled.length < 4) return toast.error("MCQ must have 4 options!");
    }
    setIsSubmitting(true);
    const data = new FormData();
    data.append("topics", JSON.stringify(formData.selectedTopicIds));
    data.append("chapterId", chapterId);
    data.append("subjectId", subjectId);
    data.append("classLevel", classLevel);
    data.append("type", formData.type);
    data.append("difficulty", formData.difficulty);
    data.append("marks", formData.marks);
    data.append("important", formData.important);

    // JSON Stringify for Category Array
    data.append("questionCategory", JSON.stringify(formData.questionCategory));

    data.append("statement", JSON.stringify(formData.statement));
    data.append("questionData", JSON.stringify(formData.questionData));
    if (formData.type === "MCQ")
      data.append("options", JSON.stringify(formData.options));
    if (imageFile) data.append("image", imageFile);
    data.append("removeImage", removeImageFlag);
    const tags = formData.boardTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    data.append("boardTags", JSON.stringify(tags));
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      if (editingId) {
        await axios.put(`${BASE_URL}/api/questions/${editingId}`, data, {
          headers,
        });
        Swal.fire({
          icon: "success",
          title: "Updated!",
          timer: 1500,
          showConfirmButton: false,
        });
        handleCancelEdit();
      } else {
        await axios.post(`${BASE_URL}/api/questions/add`, data, { headers });
        Swal.fire({
          icon: "success",
          title: "Saved!",
          timer: 1500,
          showConfirmButton: false,
        });
        setFormData((prev) => ({
          ...prev,
          statement: { en: "", ur: "" },
          questionData: initialFormState.questionData,
          options: initialFormState.options,
          boardTags: "",
          important: false,
        }));
        setPreviewImage(null);
        setImageFile(null);
        setRemoveImageFlag(false);
      }
      fetchQuestions();
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire("Error", err.response?.data?.error || "Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {(isLoading || isSubmitting) && <TMLoader />}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
      <div className="row g-4">
        <Toaster position="top-right" />
        <QuestionList
          questions={filteredQuestions}
          topics={topics}
          filterTopicId={filterTopicId}
          setFilterTopicId={setFilterTopicId}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterTypes={filterTypes}
          setFilterTypes={setFilterTypes}
          categories={getCategoriesForSubject(subjectName)}
          handleDeleteAllInTopic={handleDeleteAllInTopic}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          selectedQuestionIds={selectedQuestionIds}
          toggleQuestionSelection={toggleQuestionSelection}
          subjectName={subjectName}
          editingId={editingId}
          isUrduSubject={isUrduSubject}
        />
        <div className="col-md-5">
          <QuestionForm
            mode={mode}
            setMode={setMode}
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            imageFile={imageFile}
            previewImage={previewImage}
            handleImageChange={handleImageChange}
            clearImage={clearImage}
            handleSingleSubmit={handleSingleSubmit}
            handleCancelEdit={handleCancelEdit}
            chapterId={chapterId}
            subjectId={subjectId}
            classLevel={classLevel}
            subjectName={subjectName}
            topics={topics}
            fetchQuestions={fetchQuestions}
            isSubmitting={isSubmitting}
            isUrduSubject={isUrduSubject}
          />
        </div>
      </div>
    </>
  );
};

export default QuestionManager;
