import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageSubjects.css";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

const ManageSubjects = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState("add");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isImgLoading, setIsImgLoading] = useState(false);

  const [allSubjects, setAllSubjects] = useState([]);
  const [classOptions, setClassOptions] = useState([]); // Classes List
  const [filterClass, setFilterClass] = useState("");

  const [formData, setFormData] = useState({
    subjectName: "",
    className: "",
    year: "2025-2026",
    subjectId: "",
  });

  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`);
      setAllSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects/classes/all`);
      setClassOptions(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
    }
  };

  // --- NEW: EDIT CLASS FUNCTION ---
  const handleEditClass = async () => {
    // 1. Check karo koi class select hai ya nahi
    if (!filterClass)
      return toast.error("Please select a class to edit first!");

    // 2. Class ki ID dhundo (Kyunke state mein sirf naam hai)
    const selectedClassObj = classOptions.find((c) => c.name === filterClass);
    if (!selectedClassObj) return;

    // 3. SweetAlert Popup with Input
    const { value: newName } = await Swal.fire({
      title: "Edit Class Name",
      input: "text",
      inputLabel: `Change name for "${filterClass}"`,
      inputValue: filterClass, // Purana naam pehle se likha hoga
      showCancelButton: true,
      confirmButtonText: "Update",
      inputValidator: (value) => {
        if (!value) return "Class name cannot be empty!";
      },
    });

    // 4. API Call
    if (newName && newName !== filterClass) {
      try {
        await axios.put(
          `${BASE_URL}/api/subjects/classes/${selectedClassObj._id}`,
          { name: newName }
        );

        toast.success("Class Name Updated!");

        // 5. Update UI
        setFilterClass(newName); // Dropdown mein naya naam dikhao
        setFormData({ ...formData, className: newName }); // Form mein bhi update karo
        fetchClasses(); // List refresh karo
        fetchSubjects(); // Subjects bhi refresh karo (taaki unka filter na toote)
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to update class");
      }
    }
  };

  // --- NEW: ADD CLASS FUNCTION ---
  const handleAddNewClass = async () => {
    const { value: newClassName } = await Swal.fire({
      title: "Add New Class",
      input: "text",
      inputLabel: "Enter Class Name (e.g. 11th Class)",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "You need to write something!";
      },
    });

    if (newClassName) {
      try {
        await axios.post(`${BASE_URL}/api/subjects/classes/add`, {
          name: newClassName,
        });
        toast.success(`${newClassName} Added Successfully!`);
        fetchClasses();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to add class");
      }
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setFile(null);
    setFilterClass("");
    setFormData({ subjectName: "", className: "", year: "", subjectId: "" });
    setOriginalData(null);
    setLoading(false);
    setIsImgLoading(false);
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
        {/* LEFT: Image Preview */}
        <div className="image-section">
          <div className="image-preview-box">
            {!previewUrl && <span className="placeholder-text">Preview</span>}
            {previewUrl && (
              <>
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
                <img
                  src={previewUrl}
                  alt="Preview"
                  onLoad={() => setIsImgLoading(false)}
                  onError={() => setIsImgLoading(false)}
                  style={{ display: isImgLoading ? "none" : "block" }}
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

            {/* SELECTION AREA (Delete/Update) */}
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      style={{ flex: 1 }}
                      value={filterClass}
                      onChange={(e) => {
                        setFilterClass(e.target.value);
                        setFormData({ ...formData, subjectId: "" });
                      }}
                    >
                      <option value="">-- Select Class --</option>
                      {classOptions.map((cls) => (
                        <option key={cls._id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>

                    {/* ✏️ EDIT CLASS BUTTON (Only shows when class is selected) */}
                    {filterClass && (
                      <button
                        type="button"
                        onClick={handleEditClass}
                        title="Edit Class Name"
                        style={{
                          padding: "0 12px",
                          backgroundColor: "#ffc107",
                          border: "1px solid #e0a800",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
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

            {/* INPUT FIELDS (Add/Update) */}
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

                {/* DYNAMIC CLASS SELECTION WITH ADD & EDIT BUTTONS */}
                <div className="form-group">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <label>Class Level</label>
                    <button
                      type="button"
                      onClick={handleAddNewClass}
                      style={{
                        fontSize: "12px",
                        padding: "2px 8px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginBottom: "5px",
                      }}
                    >
                      + Add Class
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      style={{ flex: 1 }}
                      name="className"
                      value={formData.className}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFilterClass(e.target.value);
                      }}
                    >
                      <option value="">Select Class</option>
                      {classOptions.map((cls) => (
                        <option key={cls._id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>

                    {/* EDIT BUTTON (Also here in Add Mode) */}
                    {formData.className && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterClass(formData.className); // Ensure filter is synced for edit
                          handleEditClass();
                        }}
                        title="Edit Class Name"
                        style={{
                          padding: "0 12px",
                          backgroundColor: "#ffc107",
                          border: "1px solid #e0a800",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
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
