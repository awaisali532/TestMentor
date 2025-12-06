import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaFileUpload,
  FaCopy,
  FaInfoCircle,
  FaCode,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const BulkUpload = ({
  topicId,
  chapterId,
  subjectId,
  classLevel,
  onSuccess,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [bulkJson, setBulkJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const handleBulkSubmit = async () => {
    if (!topicId) return toast.error("Please select a Topic first!");
    if (!bulkJson) return toast.error("Please paste JSON data!");

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(bulkJson);
      } catch (e) {
        return toast.error("Invalid JSON! Check commas or brackets.");
      }

      if (!Array.isArray(parsedData))
        return toast.error("JSON must be an Array [...]");

      setLoading(true);
      const loadToast = toast.loading("Uploading questions...");

      await axios.post(`${BASE_URL}/api/questions/bulk-add`, {
        questions: parsedData,
        topicId,
        chapterId,
        subjectId,
        classLevel,
      });

      toast.success(`Successfully uploaded ${parsedData.length} questions!`, {
        id: loadToast,
      });
      setBulkJson("");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Bulk Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED SAMPLE JSON (Double Backslashes for Math)
  const sampleJSON = `[
  {
    "type": "MCQ",
    "questionCategory": "EXERCISE",
    "difficulty": "Medium",
    "marks": 1,
    "statement": { "en": "Value of g?", "ur": "جی کی قیمت؟" },
    "options": [
       { "en": "$9.8 ms^{-2}$", "ur": "$9.8 ms^{-2}$", "isCorrect": true },
       { "en": "10", "ur": "10", "isCorrect": false }
    ]
  },
  {
    "type": "SHORT",
    "questionCategory": "TEXT",
    "difficulty": "Easy",
    "marks": 2,
    "statement": { 
        "en": "Define Plasma Physics.", 
        "ur": "پلازما فزکس کی تعریف کریں۔" 
    }
  },
  {
    "type": "LONG",
    "questionCategory": "NUMERICAL",
    "difficulty": "Hard",
    "marks": 5,
    "statement": { 
        "en": "Derive: $S = vit + \\\\frac{1}{2}at^2$", 
        "ur": "اخذ کریں: $S = vit + \\\\frac{1}{2}at^2$" 
    }
  }
]`;

  return (
    <div className="p-3 border rounded bg-light">
      <div className="alert alert-info small mb-3">
        <FaInfoCircle className="me-2" />
        <strong>Instructions:</strong>
        <ul className="mb-0 ps-3 mt-1">
          <li>Paste JSON Array below.</li>
          <li>
            Wrap Math in <code>$ ... $</code>.
          </li>
          <li>
            <strong>Important:</strong> Use Double Backslash <code>\\\\</code>{" "}
            for commands like <code>\\\\frac</code> or <code>\\\\sqrt</code> in
            JSON.
          </li>
        </ul>
      </div>

      <div className="mb-2 text-end">
        <button
          className="btn btn-link btn-sm text-decoration-none p-0"
          onClick={() => setShowSample(!showSample)}
        >
          {showSample ? (
            <>
              <FaEyeSlash className="me-1" /> Hide Sample
            </>
          ) : (
            <>
              <FaEye className="me-1" /> View Sample JSON
            </>
          )}
        </button>
      </div>

      {showSample && (
        <div className="mb-3 position-relative">
          <pre
            className="bg-dark text-white p-3 rounded small"
            style={{ maxHeight: "200px", overflowY: "auto", fontSize: "11px" }}
          >
            {sampleJSON}
          </pre>
          <button
            className="btn btn-sm btn-light position-absolute top-0 end-0 m-2"
            onClick={() => {
              navigator.clipboard.writeText(sampleJSON);
              toast.success("Copied!");
            }}
            title="Copy to Clipboard"
          >
            <FaCopy />
          </button>
        </div>
      )}

      <div className="position-relative mb-3">
        <textarea
          className="form-control shadow-sm"
          rows="12"
          placeholder="Paste JSON Array here..."
          value={bulkJson}
          onChange={(e) => setBulkJson(e.target.value)}
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            minHeight: "300px",
          }}
        ></textarea>
      </div>

      <button
        className="btn btn-success w-100 fw-bold"
        onClick={handleBulkSubmit}
        disabled={loading || !topicId}
      >
        {loading ? (
          "Uploading..."
        ) : (
          <>
            <FaFileUpload className="me-2" /> Upload Questions JSON
          </>
        )}
      </button>
    </div>
  );
};

export default BulkUpload;
