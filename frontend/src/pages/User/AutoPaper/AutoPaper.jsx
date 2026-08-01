import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// New constraint-based engine
import { generatePaper } from "../../../utils/paperEngine/paperEngine";

// Components
import AutoHeader from "./components/AutoHeader";
import AutoLoadingScreen from "./components/AutoLoadingScreen";
import AutoCompletionModal from "./components/AutoCompletionModal";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const AutoPaper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [status, setStatus] = useState("Fetching question pools...");
  const [isComplete, setIsComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summaryCounts, setSummaryCounts] = useState({ mcq: 0, short: 0, long: 0 });
  const [qualityInfo, setQualityInfo] = useState(null);
  const [generatedPaperPayload, setGeneratedPaperPayload] = useState(null);

  const hasStartedRef = useRef(false);

  const paperInput = location.state || {};
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
  } = paperInput;

  const startAutoGeneration = useCallback(async () => {
    if (!grade || !subject || !selectedPattern) {
      toast.error("Missing paper data. Please restart the wizard.");
      navigate("/user/generate-paper");
      return;
    }

    // Reset all state for retry
    setErrorMsg(null);
    setIsComplete(false);
    setQualityInfo(null);
    setGeneratedPaperPayload(null);
    setSummaryCounts({ mcq: 0, short: 0, long: 0 });
    setStatus("Fetching question pools...");

    try {
      const token = localStorage.getItem("token");
      console.log("[AutoPaper] ▶ Starting generation");
      console.log("[AutoPaper] Grade:", grade, "| Subject:", subject, "| Pattern:", selectedPattern?.name);
      console.log("[AutoPaper] Token exists:", !!token);
      console.log("[AutoPaper] BASE_URL:", BASE_URL);

      const subjectName =
        (typeof subject === "object" ? subject?.subjectName : subject) || "General";
      const finalSubjectId =
        (typeof subject === "object" ? subject?._id : subject) ||
        selectedPattern?.subject?._id ||
        subject;

      const selectedDifficulties = autoConfig?.difficulties || [
        "EASY",
        "MEDIUM",
        "HARD",
      ];

      // ── Step 1: Parallel fetch — 3 requests fired simultaneously ─────────
      // Normalize topics — could be array of objects or strings
      const normalizedTopics = (topics || []).map((t) =>
        typeof t === "object" ? t._id || t : t
      );

      const basePayload = {
        grade,
        subject: finalSubjectId,
        difficulty: selectedDifficulties,
        topics: normalizedTopics,
      };
      const headers = { Authorization: `Bearer ${token}` };


      // ── Step 1: Instrument & Parallel Fetch ─────────
      console.log("[AutoPaper] Firing 3 parallel requests with precise performance profiling...");
      const fetchStart = performance.now();

      // Helper to fetch individual pool and instrument timing & size
      const fetchPoolWithProfiling = async (type) => {
        const start = performance.now();
        try {
          const res = await axios.post(
            `${BASE_URL}/api/questions/filter`,
            { ...basePayload, type },
            { headers }
          );
          const duration = Math.round(performance.now() - start);

          // Extract array & backend performance
          const rawData = res.data;
          const questions = Array.isArray(rawData) ? rawData : (rawData?.questions || []);
          const perf = !Array.isArray(rawData) && rawData?.performance ? rawData.performance : null;

          // Payload size calculation (in bytes -> KB / MB)
          const jsonString = JSON.stringify(rawData);
          const bytes = new Blob([jsonString]).size;
          const kb = (bytes / 1024).toFixed(1);
          const mb = (bytes / (1024 * 1024)).toFixed(2);

          return {
            type,
            questions,
            duration,
            bytes,
            kb,
            mb,
            perf,
            error: null,
          };
        } catch (e) {
          const duration = Math.round(performance.now() - start);
          console.error(`[AutoPaper Profiler] ${type} request failed after ${duration}ms:`, e.message);
          return {
            type,
            questions: [],
            duration,
            bytes: 0,
            kb: "0",
            mb: "0",
            perf: null,
            error: e.message,
          };
        }
      };

      const [mcqResult, shortResult, longResult] = await Promise.all([
        fetchPoolWithProfiling("MCQ"),
        fetchPoolWithProfiling("SHORT"),
        fetchPoolWithProfiling("LONG"),
      ]);

      const totalFetchTimeMs = Math.round(performance.now() - fetchStart);

      // Extract question arrays
      const masterPools = {
        MCQ: mcqResult.questions,
        SHORT: shortResult.questions,
        LONG: longResult.questions,
      };

      // Calculate Total Counts & Payload Sizes
      const totalQuestionsCount =
        mcqResult.questions.length +
        shortResult.questions.length +
        longResult.questions.length;

      const totalPayloadBytes =
        mcqResult.bytes + shortResult.bytes + longResult.bytes;
      const totalPayloadKb = (totalPayloadBytes / 1024).toFixed(1);
      const totalPayloadMb = (totalPayloadBytes / (1024 * 1024)).toFixed(2);

      // ── PRINT FULL PERFORMANCE REPORT TABLE TO CONSOLE ──────────────────
      console.log(
        "%c==================================================",
        "color: #4F46E5; font-weight: bold;"
      );
      console.log(
        "%c           AUTO PAPER FETCH PROFILER REPORT       ",
        "color: #4F46E5; font-weight: bold; font-size: 14px;"
      );
      console.log(
        "%c==================================================",
        "color: #4F46E5; font-weight: bold;"
      );

      [mcqResult, shortResult, longResult].forEach((item) => {
        const p = item.perf || {};
        const backendTotal = p.totalBackendTimeMs ?? "N/A";
        const dbTime = p.dbTimeMs ?? "N/A";
        const prepTime = p.prepTimeMs ?? "N/A";
        const networkOverhead =
          typeof backendTotal === "number"
            ? `${item.duration - backendTotal} ms (${((item.duration - backendTotal) / 1000).toFixed(2)} s)`
            : "N/A";

        console.log(`\n%c========== ${item.type} ==========`, "color: #0EA5E9; font-weight: bold;");
        console.log(`Questions Returned:     ${item.questions.length}`);
        console.log(`Payload Size:           ${item.kb} KB (${item.mb} MB)`);
        console.log(`Request Duration:       ${item.duration} ms (${(item.duration / 1000).toFixed(2)} s)`);
        console.log(`Database Query Time:    ${dbTime} ms`);
        console.log(`Query Prep Time:        ${prepTime} ms`);
        console.log(`Backend Total Time:     ${backendTotal} ms`);
        console.log(`Network/Transfer Time:  ${networkOverhead}`);
        if (item.error) {
          console.log(`%cError:                   ${item.error}`, "color: #EF4444;");
        }
      });

      console.log(
        "\n%c==================================================",
        "color: #4F46E5; font-weight: bold;"
      );
      console.log(
        "%cSUMMARY OVERVIEW",
        "color: #10B981; font-weight: bold;"
      );
      console.log(`Total Questions Returned: ${totalQuestionsCount}`);
      console.log(`Total Payload Transfer:   ${totalPayloadKb} KB (${totalPayloadMb} MB)`);
      console.log(`Max Parallel Fetch Time:  ${totalFetchTimeMs} ms (${(totalFetchTimeMs / 1000).toFixed(2)} s)`);
      console.log(
        "%c==================================================",
        "color: #4F46E5; font-weight: bold;"
      );

      if (totalQuestionsCount === 0) {
        setErrorMsg(
          "No questions found for the selected subject, syllabus, and difficulty. " +
            "Please check that questions have been added to the database."
        );
        return;
      }

      // ── Step 2: Constraint-based weighted selection (in-memory) ─────
      setStatus("Applying constraint-based selection engine...");

      const engineResult = generatePaper({
        sections: selectedPattern.sections || [],
        masterPools,
        subjectName,
        difficulties: selectedDifficulties,
        fetchTimeMs: totalFetchTimeMs,
      });

      const { questions, counts, quality, analytics, metrics } = engineResult;

      console.log("\n%c========== SELECTION ENGINE METRICS ==========", "color: #8B5CF6; font-weight: bold;");
      console.log(`Paper Engine Time:      ${metrics.engineTimeMs} ms`);
      console.log(`Quality Score:          ${quality?.score}/100 (Passed: ${quality?.passed})`);
      console.log(`Analytics:`, analytics);

      // ── Step 3: Handle results ────────────────────────────────────────────
      if (!questions || questions.length === 0) {
        setErrorMsg(
          "Could not select enough questions to fill the paper pattern. " +
            "Your question bank may be too small for the selected syllabus."
        );
        return;
      }

      const paperPayload = {
        grade,
        subject,
        title:         title || examLabel || "Untitled Paper",
        examDate,
        examLabel,
        syllabusLabel,
        selectedPattern,
        questions,
        topics,
        isAutoGenerated: true,
      };

      setSummaryCounts(counts);
      setQualityInfo(quality);
      setGeneratedPaperPayload(paperPayload);
      setStatus("Selection complete!");
      setIsComplete(true);

      // If quality passed → auto-redirect after brief pause (user sees success)
      if (quality.passed) {
        await wait(500);
        navigate("/user/paper-maker", { state: paperPayload });
      }
      // If quality below threshold → stay on screen, show warning + manual proceed
    } catch (err) {
      console.error("[AutoPaper] Unexpected error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  }, [
    grade,
    subject,
    selectedPattern,
    autoConfig,
    title,
    examDate,
    examLabel,
    syllabusLabel,
    topics,
    BASE_URL,
    navigate,
  ]);

  // Start on mount — ref prevents React StrictMode double-fire
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startAutoGeneration();
    }
  }, [startAutoGeneration]);

  const handleRetry = useCallback(() => {
    hasStartedRef.current = false; // Allow restart
    startAutoGeneration();
  }, [startAutoGeneration]);

  const handleProceed = useCallback(() => {
    if (generatedPaperPayload) {
      navigate("/user/paper-maker", { state: generatedPaperPayload });
    }
  }, [generatedPaperPayload, navigate]);

  return (
    <div className="min-h-screen bg-bg-body text-main flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <AutoHeader paperData={paperInput} />

      {errorMsg ? (
        <AutoCompletionModal
          counts={summaryCounts}
          error={errorMsg}
          quality={null}
          onProceed={handleProceed}
          onRetry={handleRetry}
        />
      ) : !isComplete ? (
        <AutoLoadingScreen status={status} />
      ) : (
        <AutoCompletionModal
          counts={summaryCounts}
          error={null}
          quality={qualityInfo}
          onProceed={handleProceed}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default AutoPaper;
