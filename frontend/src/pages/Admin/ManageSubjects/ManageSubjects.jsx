import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageSubjects.css";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

const ManageSubjects = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState("add");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 🆕 NEW STATE: Image Loading ke liye
  const [isImgLoading, setIsImgLoading] = useState(false);

  const [allSubjects, setAllSubjects] = useState([]);
  const [filterClass, setFilterClass] = useState("");

  const [formData, setFormData] = useState({
    subjectName: "",
    className: "",
    year: "",
    subjectId: "",
  });

  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`);
      setAllSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setFile(null);
    setFilterClass("");
    setFormData({ subjectName: "", className: "", year: "", subjectId: "" });
    setOriginalData(null);
    setLoading(false);
    setIsImgLoading(false); // Reset loader too

    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  const getButtonText = () => {
    if (loading)
      return operation === "delete"
        ? "Deleting..."
        : operation === "update"
        ? "Updating..."
        : "Adding...";
    return operation === "add"
      ? "Add Subject"
      : operation === "update"
      ? "Update Subject"
      : "Delete Subject";
  };

  // --- HANDLERS ---
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      // Local file foran load hoti hai, isliye yahan loading dikhane ki zaroorat nahi
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectSelect = (e) => {
    const selectedId = e.target.value;
    const selectedSubject = allSubjects.find((sub) => sub._id === selectedId);

    if (selectedSubject) {
      const initialData = {
        subjectId: selectedId,
        subjectName: selectedSubject.subjectName,
        className: selectedSubject.className,
        year: selectedSubject.year,
      };

      setFormData(initialData);
      setOriginalData(initialData);

      if (operation === "update" || operation === "delete") {
        // 🆕 Logic: Pehle loader chalao, phir URL set karo
        setIsImgLoading(true);
        setPreviewUrl(selectedSubject.image.url);
      }
    } else {
      setFormData({ ...formData, subjectId: "" });
      setOriginalData(null);
      setPreviewUrl(null);
      setIsImgLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (operation === "update") {
      const isNameChanged = formData.subjectName !== originalData?.subjectName;
      const isClassChanged = formData.className !== originalData?.className;
      const isYearChanged = formData.year !== originalData?.year;
      const isImageChanged = file !== null;

      if (
        !isNameChanged &&
        !isClassChanged &&
        !isYearChanged &&
        !isImageChanged
      ) {
        Swal.fire({
          title: "No changes detected",
          text: "Do you want to reset the form?",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, Reset",
        }).then((result) => {
          if (result.isConfirmed) resetForm();
        });
        return;
      }
    }

    if (operation === "delete") {
      if (!formData.subjectId)
        return toast.error("Please select a subject first!");

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing...");

    try {
      const data = new FormData();
      if (operation !== "delete") {
        data.append("subjectName", formData.subjectName);
        data.append("className", formData.className);
        data.append("year", formData.year);
        if (file) data.append("image", file);
      }

      if (operation === "add") {
        if (!file) throw new Error("Image is required for new subjects");
        await axios.post(`${BASE_URL}/api/subjects/add`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Subject Added Successfully!", { id: toastId });
      } else if (operation === "update") {
        if (!formData.subjectId) throw new Error("Select a subject first");
        await axios.put(
          `${BASE_URL}/api/subjects/${formData.subjectId}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Subject Updated Successfully!", { id: toastId });
      } else if (operation === "delete") {
        await axios.delete(`${BASE_URL}/api/subjects/${formData.subjectId}`);
        toast.success("Subject Deleted Successfully!", { id: toastId });
      }

      fetchSubjects();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="admin-card">
        {/* LEFT: Image Preview (UPDATED) */}
        <div className="image-section">
          <div className="image-preview-box">
            {/* 🆕 Condition 1: Agar URL hai hi nahi */}
            {!previewUrl && <span className="placeholder-text">Preview</span>}

            {/* 🆕 Condition 2: Agar URL hai */}
            {previewUrl && (
              <>
                {/* Jab tak load ho rha hai, spinner dikhao */}
                {isImgLoading && (
                  <div className="img-loader-container">
                    <span
                      className="spinner"
                      style={{
                        borderColor: "#007bff",
                        borderTopColor: "transparent",
                      }}
                    ></span>
                  </div>
                )}

                {/* Asli Image (Hidden until loaded) */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  onLoad={() => setIsImgLoading(false)} // Load hone par spinner gayab
                  onError={() => setIsImgLoading(false)} // Error par bhi spinner gayab (taaki phans na jaye)
                  style={{ display: isImgLoading ? "none" : "block" }} // Loading ke waqt chupao
                />
              </>
            )}
          </div>

          {(operation === "add" ||
            (operation === "update" && formData.subjectId)) && (
            <>
              <input
                type="file"
                id="fileInput"
                onClick={(e) => (e.target.value = null)}
                onChange={handleImageChange}
                className="hidden-input"
              />
              <label htmlFor="fileInput" className="upload-btn">
                {operation === "update"
                  ? "Change Image (Optional)"
                  : "Select Image"}
              </label>
            </>
          )}
        </div>

        {/* RIGHT: Form */}
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Operation</label>
              <select
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value);
                  resetForm();
                }}
                className="action-dropdown"
              >
                <option value="add">Add New Subject</option>
                <option value="update">Update Subject</option>
                <option value="delete">Delete Subject</option>
              </select>
            </div>

            {(operation === "delete" || operation === "update") && (
              <div
                style={{
                  backgroundColor:
                    operation === "delete" ? "#fff5f5" : "#f0f9ff",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #ddd",
                }}
              >
                <h4 style={{ marginTop: 0, color: "#555" }}>
                  {operation === "delete" ? "Delete Subject" : "Edit Subject"}
                </h4>

                <div className="form-group">
                  <label>Step 1: Filter Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => {
                      setFilterClass(e.target.value);
                      setFormData({ ...formData, subjectId: "" });
                    }}
                  >
                    <option value="">-- Select Class --</option>
                    <option value="9th">9th Class</option>
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Step 2: Select Subject</label>
                  <select
                    name="subjectId"
                    onChange={handleSubjectSelect}
                    disabled={!filterClass}
                    value={formData.subjectId}
                  >
                    <option value="">-- Select Subject --</option>
                    {allSubjects
                      .filter((sub) => sub.className === filterClass)
                      .map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.subjectName} ({sub.year})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {(operation === "add" ||
              (operation === "update" && formData.subjectId)) && (
              <>
                <div className="form-group">
                  <label>Subject Name</label>
                  <input
                    type="text"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleInputChange}
                    placeholder="e.g. Physics"
                  />
                </div>
                <div className="form-group">
                  <label>Class Level</label>
                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Class</option>
                    <option value="9th">9th Class</option>
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 2025-2026"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={`submit-btn btn-${operation} ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="loader-row">
                  <span className="spinner"></span> {getButtonText()}
                </div>
              ) : (
                getButtonText()
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageSubjects;
