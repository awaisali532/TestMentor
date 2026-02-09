import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "../../../context/ThemeContext";
import { generateAutoSelection } from "../../../utils/AutoPaperGenerator";
import {
  SUBJECT_RULES,
  DEFAULT_RULE,
} from "../../../config/SubjectFilterRules";

// Import Custom CSS
import "./AutoPaper.css";

// Helper: Artificial Delay for smooth UI animation
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const AutoPaper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [initializing, setInitializing] = useState(true);
  const [status, setStatus] = useState("Initializing...");
  const [progress, setProgress] = useState(5); // Start visibly

  const {
    grade,
    subject,
    topics,
    selectedPattern,
    title,
    examDate,
    examLabel,
    syllabusLabel,
    autoConfig,
  } = location.state || {};

  useEffect(() => {
    if (!grade || !subject || !selectedPattern) {
      toast.error("Missing paper data");
      navigate("/user/generate-paper");
      return;
    }
    setInitializing(false);
    generatePaper();
  }, []);

  const fetchQuestionsForSection = async (section, subjectName) => {
    const token = localStorage.getItem("token");

    const requiredChapters =
      section.linkedChapters && section.linkedChapters.length > 0
        ? section.linkedChapters
        : null;

    let requiredCategory =
      section.questionCategory !== "ANY" ? section.questionCategory : null;

    const selectedDifficulties = autoConfig?.difficulties || [
      "EASY",
      "MEDIUM",
      "HARD",
    ];

    const finalSubjectId =
      subject._id || selectedPattern?.subject?._id || subject;

    try {
      // 🔥 POST Payload Structure
      const payload = {
        grade,
        subject: finalSubjectId,
        type: section.questionType,
        difficulty: selectedDifficulties,
        chapters: [],
        topics: [],
      };

      // 🔥 Correct Logic: Chapter vs Topic
      if (requiredChapters) {
        payload.chapters = requiredChapters;
      } else {
        payload.topics = topics;
      }

      if (requiredCategory) {
        payload.category = requiredCategory;
      }

      // API Call
      const res = await axios.post(
        `${BASE_URL}/api/questions/filter`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      let pool = res.data;

      // Client Side Double Check (Strict Filter)
      if (requiredChapters) {
        pool = pool.filter((q) => {
          let qChap = q.chapter?._id || q.chapter;
          if (!qChap && q.topics?.[0])
            qChap = q.topics[0].chapter?._id || q.topics[0].chapter;
          return requiredChapters.includes(String(qChap));
        });
      }

      // Category Logic
      if (requiredCategory) {
        const subjectConfig = SUBJECT_RULES[subjectName] || {};
        const activeRule = subjectConfig[requiredCategory] || DEFAULT_RULE;

        pool = pool.filter((q) => {
          let qCats = q.category || q.questionCategory;
          if (!qCats) return false;
          if (!Array.isArray(qCats)) qCats = [qCats];

          if (
            activeRule.excludeTags &&
            activeRule.excludeTags.some((t) => qCats.includes(t))
          )
            return false;
          if (
            activeRule.mustHave &&
            activeRule.mustHave.length > 0 &&
            !activeRule.mustHave.some((t) => qCats.includes(t))
          )
            return false;
          if (activeRule.includeTags && activeRule.includeTags.length > 0) {
            if (qCats.includes(requiredCategory)) return true;
            return activeRule.includeTags.some((t) => qCats.includes(t));
          }
          return qCats.includes(requiredCategory);
        });
      }

      return pool;
    } catch (err) {
      console.error(`API Error (${section.questionType}):`, err);
      return [];
    }
  };

  const generatePaper = async () => {
    try {
      const subjectName =
        subject.subjectName ||
        selectedPattern?.subject?.subjectName ||
        "Physics";
      const sections = selectedPattern.sections || [];
      const totalSections = sections.length;

      let allSelectedQuestions = [];

      // Start Animation
      setProgress(10);
      await wait(400);

      for (let i = 0; i < totalSections; i++) {
        const sec = sections[i];
        const secIndex = i;

        // Calculate Progress Step
        const stepValue = 90 / totalSections;
        const currentProgress = 10 + i * stepValue;
        setProgress(Math.round(currentProgress));

        // 🔥 Display Specific Status (e.g., "Q.1 • MCQ")
        const qLabel = sec.questionNo || `Sec ${i + 1}`;
        setStatus(`${qLabel} • ${sec.questionType}`);

        await wait(300); // Visual Pause

        if (!sec.questionType) continue;

        // --- MCQ & SHORT ---
        if (sec.questionType === "MCQ" || sec.questionType === "SHORT") {
          const pool = await fetchQuestionsForSection(sec, subjectName);

          // Increment bar slightly after fetch
          setProgress((prev) => Math.min(prev + 2, 95));

          const needed = parseInt(sec.totalQuestions) || 0;
          const tabId = sec.questionType === "MCQ" ? "MCQ" : `sec_${secIndex}`;
          const selected = generateAutoSelection(pool, needed, [], {});

          selected.forEach((q) => allSelectedQuestions.push({ ...q, tabId }));
        }
        // --- LONG ---
        else if (sec.questionType === "LONG") {
          const totalQs = parseInt(sec.totalQuestions) || 1;

          for (let qNum = 0; qNum < totalQs; qNum++) {
            // Update Status for specific Long Q
            setStatus(`${sec.questionNo} • LONG`);
            await wait(200);

            if (sec.hasParts && sec.subQuestions) {
              let prevPartData = null;
              for (let pIdx = 0; pIdx < sec.subQuestions.length; pIdx++) {
                const subQ = sec.subQuestions[pIdx];
                const partChar = pIdx === 0 ? "a" : "b";
                const tabId = `long_${secIndex}_${qNum}_${partChar}`;
                const subConfig = {
                  ...sec,
                  questionCategory: subQ.questionCategory || "ANY",
                  questionType: "LONG",
                };

                const pool = await fetchQuestionsForSection(
                  subConfig,
                  subjectName,
                );

                let autoOptions = {};
                if (partChar === "b" && prevPartData) {
                  const chapA =
                    prevPartData.chapter?._id || prevPartData.chapter;
                  if (chapA) autoOptions.avoidChapters = [chapA];
                  if (prevPartData.difficulty === "Hard")
                    autoOptions.targetDifficulty = "Medium";
                  else autoOptions.targetDifficulty = "Hard";
                }

                const selected = generateAutoSelection(
                  pool,
                  1,
                  [],
                  autoOptions,
                );
                if (selected.length > 0) {
                  allSelectedQuestions.push({ ...selected[0], tabId });
                  if (partChar === "a") prevPartData = selected[0];
                }
              }
            } else {
              const tabId = `long_${secIndex}_${qNum}_full`;
              const pool = await fetchQuestionsForSection(sec, subjectName);
              const selected = generateAutoSelection(pool, 1, [], {});
              if (selected.length > 0)
                allSelectedQuestions.push({ ...selected[0], tabId });
            }
          }
        }
      }

      // Finish
      setProgress(100);
      setStatus("COMPLETED");
      await wait(500);

      if (allSelectedQuestions.length === 0) {
        toast.error("Could not find any matching questions!");
        return;
      }

      const paperPayload = {
        grade,
        subject,
        title,
        examDate,
        examLabel,
        syllabusLabel,
        selectedPattern,
        questions: allSelectedQuestions,
        topics,
        isAutoGenerated: true,
      };

      navigate("/user/print-paper", { state: paperPayload });
    } catch (err) {
      console.error(err);
      toast.error("Auto-Generation Failed");
      navigate("/user/generate-paper");
    }
  };

  return (
    <div
      className={`ap-container ${theme === "dark" ? "ap-dark" : "ap-light"}`}
    >
      <Toaster />

      {!initializing && (
        <>
          <h2 className="ap-title">AI Paper Generator</h2>

          <div className="ap-progress-track">
            <div
              className="ap-progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="ap-status">{status}</p>
          <p className="ap-subtext">
            {progress < 100
              ? "Selecting optimized questions..."
              : "Redirecting..."}
          </p>
        </>
      )}
    </div>
  );
};

export default AutoPaper;
