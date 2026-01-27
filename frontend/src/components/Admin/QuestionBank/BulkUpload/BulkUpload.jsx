import React, { useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCloudUploadAlt,
  FaFileCode,
  FaEye,
  FaEyeSlash,
  FaMagic,
} from "react-icons/fa";
import "./BulkUpload.css";
import TMLoader from "../../../../components/common/TMLoader/TMLoader";
import { getExampleForSubject } from "../../../../config/BulkExamples";

const BulkUpload = ({
  chapterId,
  subjectId,
  classLevel,
  subjectName,
  onSuccess,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const exampleJson = useMemo(() => {
    return getExampleForSubject(subjectName);
  }, [subjectName]);

  // ✅ Helper: LaTeX Backslashes Fixer
  const sanitizeJson = (input) => {
    // 1. Replace single backslashes with double backslashes for LaTeX words
    // Ye regex dhoondta hai '\' jo 't' (times) ya 'm' (mu) jese words se pehle ho
    let fixed = input.replace(/\\([^"\\/bfnrtu])/g, "\\\\$1");

    // Fix specific LaTeX commands commonly used in Physics/Math
    fixed = fixed.replace(
      /\\(times|theta|tau|tan|nu|neq|mu|pi|alpha|beta|gamma|delta|frac|sqrt|hat|vec)/g,
      "\\\\$1",
    );

    return fixed;
  };

  const handleUpload = async () => {
    if (!jsonInput.trim()) return toast.error("Please paste JSON data!");

    setLoading(true);
    try {
      let parsedQuestions;

      // ✅ TRY 1: Direct Parse
      try {
        parsedQuestions = JSON.parse(jsonInput);
      } catch (e1) {
        // ✅ TRY 2: Auto-Fix LaTeX & Parse again
        try {
          const fixedJson = sanitizeJson(jsonInput);
          parsedQuestions = JSON.parse(fixedJson);
          console.log("Auto-fixed JSON successfully.");
        } catch (e2) {
          setLoading(false);
          return Swal.fire({
            title: "Invalid JSON!",
            text: "Syntax Error. Check for missing commas or quotes. LaTeX commands (\\mu, \\times) might need double slashes (\\\\).",
            icon: "error",
            footer: `<pre class="text-danger text-start small">${e1.message}</pre>`,
            background: "var(--card-bg)",
            color: "var(--text-main)",
          });
        }
      }

      if (!Array.isArray(parsedQuestions)) {
        setLoading(false);
        return toast.error("JSON must be an Array [ ... ]");
      }

      // 🛑 NORMALIZATION & VALIDATION LOOP
      const normalizedQuestions = parsedQuestions.map((q, i) => {
        const index = i + 1;

        // 1. Validate Type
        if (!q.type) {
          throw new Error(`Item #${index}: Question Type is missing!`);
        }

        // 2. ✅ AUTO-FIX: Convert String Category to Array
        // Agar user ne "TEXT" likha hai to usay ["TEXT"] bana do
        let categories = [];
        if (q.questionCategory) {
          if (Array.isArray(q.questionCategory)) {
            categories = q.questionCategory;
          } else {
            categories = [q.questionCategory];
          }
        } else {
          // Default Category based on type
          categories = q.type === "MCQ" ? ["MCQ_GENERAL"] : ["TEXT"];
        }

        // 3. Validate MCQs
        if (q.type === "MCQ") {
          if (!Array.isArray(q.options) || q.options.length < 4) {
            throw new Error(
              `Item #${index} (MCQ): Must have exactly 4 options!`,
            );
          }
          const validOptions = q.options.filter(
            (opt) =>
              (opt.en && opt.en.trim() !== "") ||
              (opt.ur && opt.ur.trim() !== ""),
          );
          if (validOptions.length < 4) {
            throw new Error(
              `Item #${index} (MCQ): All 4 options must be filled!`,
            );
          }
        }

        // Return normalized object
        return {
          ...q,
          questionCategory: categories, // Updated Array
        };
      });

      // API Call
      const res = await axios.post(`${BASE_URL}/api/questions/bulk-add`, {
        questions: normalizedQuestions,
        chapterId,
        subjectId,
        classLevel,
      });

      const { failedQuestions, successCount } = res.data;

      if (failedQuestions && failedQuestions.length > 0) {
        let htmlReport = `<div class="text-start small" style="max-height: 200px; overflow-y: auto;">`;
        failedQuestions.forEach((failItem) => {
          htmlReport += `
            <div class="mb-2 p-2 border border-danger rounded bg-light">
              <strong class="text-danger">Item #${failItem.index}:</strong> ${failItem.reason}
            </div>`;
        });
        htmlReport += `</div>`;

        Swal.fire({
          title: `Partial Success!`,
          text: `${successCount} Added. ${failedQuestions.length} Failed.`,
          html: htmlReport,
          icon: "warning",
          background: "var(--card-bg)",
          color: "var(--text-main)",
        });
      } else {
        Swal.fire({
          title: "Success!",
          text: `All ${successCount} questions added!`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "var(--card-bg)",
          color: "var(--text-main)",
        });
      }

      setJsonInput("");
      onSuccess();
    } catch (err) {
      // Catch validation errors thrown from loop or API errors
      Swal.fire({
        title: "Error!",
        text: err.message || err.response?.data?.error || "Upload Failed",
        icon: "error",
        background: "var(--card-bg)",
        color: "var(--text-main)",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <TMLoader />}
      <div className="bulk-upload-container p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2 text-accent">
            <FaFileCode size={20} />
            <h6 className="m-0 fw-bold">Bulk Upload ({subjectName})</h6>
          </div>
          <button
            className="btn-icon-text"
            onClick={() => setShowExample(!showExample)}
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-main)",
              padding: "5px 10px",
              borderRadius: "6px",
              fontSize: "0.85rem",
            }}
          >
            {showExample ? <FaEyeSlash /> : <FaEye />} Example
          </button>
        </div>

        {showExample && (
          <div className="json-example-box mb-3">
            <p className="mb-1 text-accent fw-bold small">Format:</p>
            <pre
              style={{
                background: "var(--bg-body)",
                color: "var(--text-main)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                fontSize: "0.8rem",
              }}
            >
              {exampleJson}
            </pre>
          </div>
        )}

        <div className="position-relative">
          <textarea
            className="form-control custom-input mb-3 font-monospace small"
            rows="10"
            placeholder="Paste JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{
              background: "var(--bg-body)",
              color: "var(--text-main)",
              borderColor: "var(--border-color)",
            }}
          ></textarea>

          {/* Manual Fix Button */}
          {jsonInput && (
            <button
              className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1"
              onClick={() => setJsonInput(sanitizeJson(jsonInput))}
              title="Auto-Fix Backslashes for LaTeX"
              style={{
                fontSize: "0.75rem",
                opacity: 0.9,
              }}
            >
              <FaMagic /> Auto-Fix
            </button>
          )}
        </div>

        <button
          className="btn-primary-gradient w-100"
          onClick={handleUpload}
          disabled={loading || !jsonInput.trim()}
        >
          <FaCloudUploadAlt className="me-2" /> Upload JSON
        </button>
      </div>
    </>
  );
};

export default BulkUpload;
