import React, { useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCloudUploadAlt,
  FaFileCode,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./BulkUpload.css";
import TMLoader from "../../../../components/common/TMLoader/TMLoader";

// ✅ Import Example Helper
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

  // ✅ Get Dynamic Example based on Subject Name
  // useMemo tabhi run hoga jab subjectName change hoga (Performance Optimization)
  const exampleJson = useMemo(() => {
    return getExampleForSubject(subjectName);
  }, [subjectName]);

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
          confirmButtonText: "OK",
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
            <p className="mb-1 text-accent fw-bold small">
              Required Format (Array):
            </p>
            {/* ✅ Dynamic Example Render Here */}
            <pre>{exampleJson}</pre>
          </div>
        )}

        <textarea
          className="form-control custom-input mb-3 font-monospace small"
          rows="10"
          placeholder="Paste JSON here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        ></textarea>

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
