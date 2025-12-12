import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaSpinner, FaFileCode } from "react-icons/fa";

// ✅ Props main se 'topics' hata dia, ab wo zaroori nahi
const BulkUpload = ({ chapterId, subjectId, classLevel, onSuccess }) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!jsonInput.trim()) {
      return toast.error("Please paste JSON data!");
    }

    setLoading(true);
    try {
      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(jsonInput);
      } catch (e) {
        return toast.error("Invalid JSON Format!");
      }

      if (!Array.isArray(parsedQuestions)) {
        return toast.error("JSON must be an Array [ ... ].");
      }

      // 🔄 Change: topics array UI se nahi bhej rahay, backend khud JSON se nikalega
      const res = await axios.post(`${BASE_URL}/api/questions/bulk-add`, {
        questions: parsedQuestions,
        chapterId,
        subjectId,
        classLevel,
      });

      toast.success(res.data.message);

      // Agar kuch warnings aayi hain (kuch topics nahi milay)
      if (res.data.warnings && res.data.warnings.length > 0) {
        toast.error(
          `Warning: ${res.data.warnings.length} questions skipped due to invalid Topic Numbers.`
        );
        console.warn(res.data.warnings);
      }

      setJsonInput("");
      onSuccess();
    } catch (err) {
      console.error(err);
      // Agar backend se specific error message aaye
      const errorMsg = err.response?.data?.error || "Upload Failed";
      const details = err.response?.data?.details; // List of failed questions

      toast.error(errorMsg);
      if (details) {
        alert("Errors:\n" + details.join("\n")); // Show detailed alert
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center p-4 border border-dashed rounded bg-light">
      <FaFileCode className="text-secondary mb-3" size={40} />
      <h6 className="fw-bold text-dark">Smart Bulk Upload (JSON)</h6>

      <div className="alert alert-info py-2 small text-start">
        <strong>Instructions:</strong>
        <ul className="mb-0 ps-3">
          <li>
            Define topics inside the JSON using{" "}
            <code>"topics": ["1.1", "1.3"]</code>
          </li>
          <li>
            Make sure the <b>Topic Numbers</b> exist in the database.
          </li>
        </ul>
      </div>

      <textarea
        className="form-control mb-3 small font-monospace"
        rows="10"
        placeholder='[
  {
    "topics": ["1.1", "1.2"], 
    "statement": { "en": "Define Physics?" },
    "type": "SHORT",
    "difficulty": "Easy"
  }
]'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      ></textarea>

      <button
        className="btn btn-dark w-100 fw-bold"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <FaSpinner className="icon-spin me-2" />
        ) : (
          <FaCloudUploadAlt className="me-2" />
        )}
        {loading ? "Mapping & Uploading..." : "Upload JSON"}
      </button>
    </div>
  );
};

export default BulkUpload;
