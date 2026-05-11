import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./PracticeMode.css";
import PracticeQuestionCard from "./PracticeQuestionCard";
import TMLoader from "../../../components/common/TMLoader/TMLoader";

const PracticeMode = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // States for Dropdowns
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  // Selected Values
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Data States
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFilters, setFetchingFilters] = useState(true);

  // 1. Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(data);
      } catch (error) {
        toast.error("Failed to load subjects");
      } finally {
        setFetchingFilters(false);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Fetch Chapters
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setSelectedChapter("");
      return;
    }
    const fetchChapters = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${BASE_URL}/api/chapters/subject/${selectedSubject}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setChapters(data);
      } catch (error) {
        toast.error("Failed to load chapters");
      }
    };
    fetchChapters();
  }, [selectedSubject]);

  // 3. Fetch Topics
  useEffect(() => {
    if (!selectedChapter) {
      setTopics([]);
      setSelectedTopic("");
      return;
    }
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${BASE_URL}/api/topics/chapter/${selectedChapter}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setTopics(data);
      } catch (error) {
        toast.error("Failed to load topics");
      }
    };
    fetchTopics();
  }, [selectedChapter]);

  // 4. Fetch Questions
  const handleFetchQuestions = async () => {
    if (!selectedSubject || !selectedChapter) {
      return toast.error("Please select at least a Subject and Chapter");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        subject: selectedSubject,
        grade: subjects.find((s) => s._id === selectedSubject)?.className,
        chapters: [selectedChapter],
        topics: selectedTopic ? [selectedTopic] : [],
      };

      const { data } = await axios.post(
        `${BASE_URL}/api/questions/filter`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setQuestions(data);

      if (data.length === 0) {
        toast("No questions found for this selection", { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error("Failed to fetch practice questions");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 5. GROUPING LOGIC: Group by Topic -> Then by Type
  const groupedQuestions = useMemo(() => {
    const groups = {};

    questions.forEach((q) => {
      // Get Topic Info (Safely)
      const topicId = q.topics?.[0]?._id || "unassigned";
      const topicNum = q.topics?.[0]?.topicNumber || "";
      const topicName =
        q.topics?.[0]?.name?.en || q.topics?.[0]?.name || "General Questions";

      const fullTopicName = topicNum ? `${topicNum} - ${topicName}` : topicName;

      // Initialize Group if not exists
      if (!groups[topicId]) {
        groups[topicId] = {
          title: fullTopicName,
          mcqs: [],
          shorts: [],
          longs: [],
        };
      }

      // Sort into categories
      if (q.type === "MCQ") groups[topicId].mcqs.push(q);
      else if (q.type === "SHORT") groups[topicId].shorts.push(q);
      else if (q.type === "LONG") groups[topicId].longs.push(q);
      else groups[topicId].shorts.push(q); // fallback
    });

    // Object ko array mein convert kar rahay hain map chalane k liye
    return Object.values(groups);
  }, [questions]);

  return (
    <div className="practice-container">
      {loading && <TMLoader />}

      <div className="practice-header">
        <h2 className="fw-bold text-main">
          Study <span className="text-accent">Mode</span>
        </h2>
        <p className="text-muted">
          Select a topic to practice questions and test your knowledge.
        </p>
      </div>

      {/* FILTER SECTION */}
      <div className="practice-filters">
        <div className="filter-group">
          <label>Subject</label>
          <select
            className="filter-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={fetchingFilters}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectName} ({sub.className})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Chapter</label>
          <select
            className="filter-select"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            disabled={!selectedSubject || chapters.length === 0}
          >
            <option value="">-- Select Chapter --</option>
            {chapters.map((chap) => (
              <option key={chap._id} value={chap._id}>
                Ch {chap.chapterNumber}:{" "}
                {chap.name?.en || chap.name?.ur || chap.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Topic (Optional)</label>
          <select
            className="filter-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedChapter || topics.length === 0}
          >
            <option value="">-- All Topics --</option>
            {topics.map((top) => (
              <option key={top._id} value={top._id}>
                {top.topicNumber} {top.name?.en || top.name?.ur || top.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="fetch-btn"
          onClick={handleFetchQuestions}
          disabled={!selectedChapter || loading}
        >
          Start Practice
        </button>
      </div>

      {/* 🔥 GROUPED QUESTIONS FEED */}
      <div className="practice-feed">
        {groupedQuestions.length > 0
          ? groupedQuestions.map((group, index) => (
              <div key={index} className="topic-group-section">
                {/* Topic Banner */}
                <div className="topic-banner">
                  <h4>{group.title}</h4>
                </div>

                {/* MCQs Section */}
                {group.mcqs.length > 0 && (
                  <div className="question-type-section">
                    <h5 className="type-heading">
                      📝 Multiple Choice Questions
                    </h5>
                    {group.mcqs.map((q, idx) => (
                      <PracticeQuestionCard
                        key={q._id}
                        question={q}
                        index={idx}
                      />
                    ))}
                  </div>
                )}

                {/* Short Questions Section */}
                {group.shorts.length > 0 && (
                  <div className="question-type-section">
                    <h5 className="type-heading">✍️ Short Questions</h5>
                    {group.shorts.map((q, idx) => (
                      <PracticeQuestionCard
                        key={q._id}
                        question={q}
                        index={idx}
                      />
                    ))}
                  </div>
                )}

                {/* Long Questions Section */}
                {group.longs.length > 0 && (
                  <div className="question-type-section">
                    <h5 className="type-heading">📚 Long/Detailed Questions</h5>
                    {group.longs.map((q, idx) => (
                      <PracticeQuestionCard
                        key={q._id}
                        question={q}
                        index={idx}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          : !loading && (
              <div className="text-center text-muted mt-5">
                Select filters and click "Start Practice" to load questions.
              </div>
            )}
      </div>
    </div>
  );
};

export default PracticeMode;
