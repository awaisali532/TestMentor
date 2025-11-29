import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageSubjects.css";

const ManageSubjects = () => {
  // --- 1. CONFIGURATION ---
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- 2. STATES ---
  const [loading, setLoading] = useState(false); // <--- LOADER STATE
  const [operation, setOperation] = useState("add"); // 'add', 'delete'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Data Lists
  const [allSubjects, setAllSubjects] = useState([]);
  const [filterClass, setFilterClass] = useState(""); // Delete filter

  // Form Data
  const [formData, setFormData] = useState({
    subjectName: "",
    className: "",
    year: "",
    subjectId: "",
  });

  // --- 3. EFFECTS ---
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`);
      setAllSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // --- 4. HELPER FUNCTIONS ---
  // Button text dynamic karne ke liye
  const getButtonText = () => {
    if (loading) {
      return operation === "delete" ? "Deleting..." : "Adding...";
    }
    return operation === "add" ? "Add Subject" : "Delete Subject";
  };

  // --- 5. HANDLERS ---
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Delete ke liye Filter Logic
  const filteredSubjects = filterClass
    ? allSubjects.filter((sub) => sub.className === filterClass)
    : [];

  const handleSubjectSelect = (e) => {
    const selectedId = e.target.value;
    const selectedSubject = allSubjects.find((sub) => sub._id === selectedId);

    setFormData({ ...formData, subjectId: selectedId });

    if (selectedSubject) {
      setPreviewUrl(selectedSubject.image.url);
    } else {
      setPreviewUrl(null);
    }
  };

  // --- 6. SUBMIT LOGIC (MAIN) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Agar pehle se load ho rha hai to rok do (Double Click Protection)
    if (loading) return;

    setLoading(true); // START LOADER

    try {
      if (operation === "add") {
        // --- ADD LOGIC ---
        const data = new FormData();
        data.append("image", file);
        data.append("subjectName", formData.subjectName);
        data.append("className", formData.className);
        data.append("year", formData.year);

        await axios.post(`${BASE_URL}/api/subjects/add`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Subject Added Successfully!");

        // List refresh karo
        fetchSubjects();
        // --- RESET LOGIC ---
        setPreviewUrl(null);
        setFile(null);
        setFormData({
          subjectName: "",
          className: "",
          year: "",
          subjectId: "",
        });

        // 🟢 FIX: Browser ka input bhi zabardasti khali karo
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";
      } else if (operation === "delete") {
        // --- DELETE LOGIC ---
        if (!formData.subjectId) {
          setLoading(false);
          return alert("Please select a subject first");
        }

        await axios.delete(`${BASE_URL}/api/subjects/${formData.subjectId}`);
        alert("Subject Deleted Successfully!");

        // Reset UI specific to delete
        fetchSubjects();
        setPreviewUrl(null);
        setFilterClass("");
        setFormData({ ...formData, subjectId: "" });
      }

      // --- RESET COMMON FIELDS (Only for Add) ---
      if (operation === "add") {
        setPreviewUrl(null);
        setFile(null);
        setFormData({
          subjectName: "",
          className: "",
          year: "",
          subjectId: "",
        });
      }
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false); // STOP LOADER (Hamesha chalega chahe error ho ya success)
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-card">
        {/* --- LEFT: Image Section --- */}
        <div className="image-section">
          <div className="image-preview-box">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" />
            ) : (
              <span className="placeholder-text">Image Preview</span>
            )}
          </div>

          {/* Sirf 'Add' mode mein upload button dikhao */}
          {operation === "add" && (
            <>
              <input
                type="file"
                id="fileInput"
                onChange={handleImageChange}
                className="hidden-input"
              />
              <label htmlFor="fileInput" className="upload-btn">
                Select Image
              </label>
            </>
          )}
        </div>

        {/* --- RIGHT: Form Section --- */}
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            {/* Operation Selector */}
            <div className="form-group">
              <label>Select Operation</label>
              <select
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value);
                  setPreviewUrl(null);
                  setFormData({ ...formData, subjectId: "" });
                }}
                className="action-dropdown"
              >
                <option value="add">Add New Subject</option>
                <option value="delete">Delete Subject</option>
              </select>
            </div>

            {/* --- DYNAMIC FIELDS --- */}

            {/* DELETE MODE */}
            {operation === "delete" ? (
              <div
                style={{
                  backgroundColor: "#fff5f5",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ffcccc",
                }}
              >
                <h4 style={{ marginTop: 0, color: "#c00" }}>Delete Subject</h4>

                {/* Step 1: Class Filter */}
                <div className="form-group">
                  <label>Step 1: Filter by Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => {
                      setFilterClass(e.target.value);
                      setFormData({ ...formData, subjectId: "" });
                      setPreviewUrl(null);
                    }}
                  >
                    <option value="">-- Select Class --</option>
                    <option value="9th">9th Class</option>
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                  </select>
                </div>

                {/* Step 2: Subject Select */}
                <div className="form-group">
                  <label>Step 2: Select Subject</label>
                  <select
                    name="subjectId"
                    onChange={handleSubjectSelect}
                    disabled={!filterClass}
                    style={{ cursor: filterClass ? "pointer" : "not-allowed" }}
                  >
                    <option value="">
                      {filterClass
                        ? `-- Select ${filterClass} Subject --`
                        : "-- First Select a Class --"}
                    </option>
                    {filteredSubjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subjectName} ({sub.year})
                      </option>
                    ))}
                  </select>
                  {filterClass && filteredSubjects.length === 0 && (
                    <small style={{ color: "orange" }}>
                      No subjects found for this class.
                    </small>
                  )}
                </div>
              </div>
            ) : (
              // ADD MODE
              <>
                <div className="form-group">
                  <label>Subject Name</label>
                  <input
                    type="text"
                    name="subjectName"
                    value={formData.subjectName}
                    placeholder="e.g. Physics"
                    onChange={handleInputChange}
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
                    placeholder="e.g. 2025-2026"
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* --- SUBMIT BUTTON WITH LOADER --- */}
            <button
              type="submit"
              className={`submit-btn btn-${operation} ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="loader-row">
                  <span className="spinner"></span>
                  {getButtonText()}
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
