import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCloudUploadAlt,
  FaFileCode,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"; // ❌ Spinner Removed
import "./BulkUpload.css";

// ✅ Import Custom Loader
import TMLoader from "../../../../components/common/TMLoader/TMLoader";

const BulkUpload = ({ chapterId, subjectId, classLevel, onSuccess }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleUpload = async () => {
    if (!jsonInput.trim()) return toast.error("Please paste JSON data!");

    setLoading(true); // ✅ TMLoader Show hoga
    try {
      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(jsonInput);
      } catch (e) {
        return toast.error("Invalid JSON Format!");
      }

      if (!Array.isArray(parsedQuestions))
        return toast.error("JSON must be an Array [ ... ]");

      const res = await axios.post(`${BASE_URL}/api/questions/bulk-add`, {
        questions: parsedQuestions,
        chapterId,
        subjectId,
        classLevel,
      });

      const { message, failedQuestions, successCount } = res.data;

      if (failedQuestions && failedQuestions.length > 0) {
        let htmlReport = `<div class="text-start small" style="max-height: 200px; overflow-y: auto;">`;
        failedQuestions.forEach((failItem) => {
          htmlReport += `
            <div class="mb-2 p-2 border border-danger rounded bg-light">
              <strong class="text-danger">Item #${failItem.index}:</strong> ${
            failItem.reason
          } <br/>
              <span class="text-muted fst-italic">"${
                failItem.statement
                  ? failItem.statement.substring(0, 40) + "..."
                  : "No text"
              }"</span>
            </div>`;
        });
        htmlReport += `</div>`;

        Swal.fire({
          title: `Partial Success!`,
          text: `${successCount} Added. ${failedQuestions.length} Failed.`,
          html: htmlReport,
          icon: "warning",
          confirmButtonColor: "#f0ad4e",
          confirmButtonText: "OK, Got it",
          background: "var(--card-bg)",
          color: "var(--text-main)",
        });
      } else {
        Swal.fire({
          title: "Success!",
          text: `All ${successCount} questions added with AI Vectors.`,
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
      const errorMsg = err.response?.data?.error || "Upload Failed";
      const details = err.response?.data?.details;

      if (details) {
        Swal.fire({
          title: "Format Errors",
          html: details.join("<br>"),
          icon: "error",
          background: "var(--card-bg)",
          color: "var(--text-main)",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: errorMsg,
          icon: "error",
          background: "var(--card-bg)",
          color: "var(--text-main)",
        });
      }
    } finally {
      setLoading(false); // ✅ TMLoader Hide hoga
    }
  };

  const isBulkValid = jsonInput.trim().length > 0;

  return (
    <>
      {/* ✅ FULL SCREEN LOADER */}
      {loading && <TMLoader />}

      <div className="bulk-upload-container p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2 text-accent">
            <FaFileCode size={20} />
            <h6 className="m-0 fw-bold">Smart Bulk Upload</h6>
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
            <p className="mb-1 text-accent fw-bold small">
              Required Format (Array):
            </p>
            <pre>
              {`[
  {
    "topics": ["1.1"], 
    "type": "MCQ", 
    "difficulty": "Easy",
    "statement": { "en": "What is Force?", "ur": "فورس..." },
    "options": [
      { "en": "Opt A", "isCorrect": true },
      { "en": "Opt B", "isCorrect": false },
      { "en": "Opt C", "isCorrect": false },
      { "en": "Opt D", "isCorrect": false }
    ]
  }
]`}
            </pre>
          </div>
        )}

        <textarea
          className="form-control custom-input mb-3 font-monospace small"
          rows="10"
          placeholder="Paste your JSON array here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        ></textarea>

        {/* ✅ NORMAL BUTTON (Spinner Removed) */}
        <button
          className="btn-primary-gradient w-100"
          onClick={handleUpload}
          disabled={loading || !isBulkValid}
        >
          <FaCloudUploadAlt className="me-2" /> Upload JSON
        </button>

        {!isBulkValid && (
          <div className="text-danger small mt-2">
            * Code block cannot be empty.
          </div>
        )}
      </div>
    </>
  );
};

export default BulkUpload;
