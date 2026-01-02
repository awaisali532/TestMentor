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
    // Aur unhe '\\' bana deta hai taake JSON crash na ho.

    // Step A: Fix simple invalid escapes like \m, \c, \p, etc. (Common in LaTeX)
    let fixed = input.replace(/\\([^"\\/bfnrtu])/g, "\\\\$1");

    // Step B: Fix specific LaTeX commands that might overlap with valid escapes
    // e.g. \times (\t is tab), \nu (\n is newline). We want literal text.
    fixed = fixed.replace(/\\(times|theta|tau|tan|nu|neq)/g, "\\\\$1");

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
          // Agar ab bhi fail ho, to error dikhao
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

      // 🛑 VALIDATION LOOP
      for (let i = 0; i < parsedQuestions.length; i++) {
        const q = parsedQuestions[i];
        const index = i + 1;

        if (!q.type) {
          setLoading(false);
          return toast.error(`Item #${index}: Question Type is missing!`);
        }

        if (q.type === "MCQ") {
          if (!Array.isArray(q.options) || q.options.length < 4) {
            setLoading(false);
            return toast.error(
              `Item #${index} (MCQ): Must have exactly 4 options!`
            );
          }
          const validOptions = q.options.filter(
            (opt) =>
              (opt.en && opt.en.trim() !== "") ||
              (opt.ur && opt.ur.trim() !== "")
          );
          if (validOptions.length < 4) {
            setLoading(false);
            return toast.error(
              `Item #${index} (MCQ): All 4 options must be filled!`
            );
          }
        }
      }

      // API Call
      const res = await axios.post(`${BASE_URL}/api/questions/bulk-add`, {
        questions: parsedQuestions,
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
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.error || "Upload Failed",
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
          >
            {showExample ? <FaEyeSlash /> : <FaEye />} Example
          </button>
        </div>

        {showExample && (
          <div className="json-example-box mb-3">
            <p className="mb-1 text-accent fw-bold small">Format:</p>
            <pre>{exampleJson}</pre>
          </div>
        )}

        <div className="position-relative">
          <textarea
            className="form-control custom-input mb-3 font-monospace small"
            rows="10"
            placeholder="Paste JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          ></textarea>

          {/* Manual Fix Button (Optional) */}
          {jsonInput && (
            <button
              className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2"
              onClick={() => setJsonInput(sanitizeJson(jsonInput))}
              title="Auto-Fix Backslashes"
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
