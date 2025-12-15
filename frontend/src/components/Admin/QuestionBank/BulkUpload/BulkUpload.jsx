import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCloudUploadAlt,
  FaSpinner,
  FaFileCode,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./BulkUpload.css";

const BulkUpload = ({ chapterId, subjectId, classLevel, onSuccess }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleUpload = async () => {
    if (!jsonInput.trim()) return toast.error("Please paste JSON data!");

    setLoading(true);
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

      toast.success(res.data.message || "Upload Successful");

      if (res.data.warnings && res.data.warnings.length > 0) {
        toast(
          (t) => (
            <span>
              <b>Warning:</b> {res.data.warnings.length} questions skipped.
            </span>
          ),
          { icon: "⚠️" }
        );
      }

      setJsonInput("");
      onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Upload Failed";
      const details = err.response?.data?.details;

      if (details) {
        Swal.fire({
          title: "Detailed Errors",
          html: details.join("<br>"),
          icon: "error",
          background: "var(--card-bg)",
          color: "var(--text-main)",
        });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ VALIDATION: Disable button if empty
  const isBulkValid = jsonInput.trim().length > 0;

  return (
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

      {/* ✅ DISABLED LOGIC APPLIED */}
      <button
        className="btn-primary-gradient w-100"
        onClick={handleUpload}
        disabled={loading || !isBulkValid}
      >
        {loading ? (
          <>
            <FaSpinner className="icon-spin me-2" /> Uploading...
          </>
        ) : (
          <>
            <FaCloudUploadAlt className="me-2" /> Upload JSON
          </>
        )}
      </button>

      {!isBulkValid && (
        <div className="text-danger small mt-2">
          * Code block cannot be empty.
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
