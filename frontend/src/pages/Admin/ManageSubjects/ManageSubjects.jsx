import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageSubjects.css";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// PROFESSIONAL ICONS IMPORT
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaFolderOpen,
  FaTimes,
  FaCloudUploadAlt,
  FaSave,
} from "react-icons/fa";

const ManageSubjects = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState("add");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isImgLoading, setIsImgLoading] = useState(false);

  // Data States
  const [allSubjects, setAllSubjects] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [filterClass, setFilterClass] = useState("");

  const [formData, setFormData] = useState({
    subjectName: "",
    className: "",
    year: "2025-2026",
    subjectId: "",
  });

  const [originalData, setOriginalData] = useState(null);

  // Modal States
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [subjectChapters, setSubjectChapters] = useState([]);
  const [newChapter, setNewChapter] = useState({
    number: "",
    name: "",
    desc: "",
  });

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`);
      setAllSubjects(res.data);
    } catch (err) {
      console.error("Subjects fetch error:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subjects/classes/all`);
      setClassOptions(res.data);
    } catch (err) {
      console.error("Classes fetch error:", err);
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chapters/subject/${subjectId}`
      );
      setSubjectChapters(res.data);
    } catch (err) {
      toast.error("Failed to load chapters");
    }
  };

  // --- HELPER FUNCTIONS ---
  const resetForm = () => {
    setPreviewUrl(null);
    setFile(null);
    setFilterClass("");
    setFormData({
      subjectName: "",
      className: "",
      year: "2025-2026",
      subjectId: "",
    });
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

  // --- CHAPTER CRUD OPERATIONS ---
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.number || !newChapter.name)
      return toast.error("Chapter Number and Name required!");

    try {
      await axios.post(`${BASE_URL}/api/chapters/add`, {
        subjectId: formData.subjectId,
        chapterNumber: newChapter.number,
        name: newChapter.name,
        description: newChapter.desc,
      });
      toast.success("Chapter Added Successfully");
      fetchChapters(formData.subjectId);
      setNewChapter({ number: "", name: "", desc: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Error adding chapter");
    }
  };

  const handleEditChapter = async (chapter) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Chapter Details",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Chapter No" value="${chapter.chapterNumber}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Chapter Name" value="${chapter.name}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => {
        return [
          document.getElementById("swal-input1").value,
          document.getElementById("swal-input2").value,
        ];
      },
    });

    if (formValues) {
      const [newNum, newName] = formValues;
      if (!newNum || !newName) return toast.error("Both fields are required");

      try {
        await axios.put(`${BASE_URL}/api/chapters/${chapter._id}`, {
          chapterNumber: newNum,
          name: newName,
        });
        toast.success("Chapter Updated!");
        fetchChapters(formData.subjectId);
      } catch (err) {
        toast.error(err.response?.data?.error || "Update Failed");
      }
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    const result = await Swal.fire({
      title: "Delete Chapter?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/chapters/${chapterId}`);
        toast.success("Chapter Deleted");
        fetchChapters(formData.subjectId);
      } catch (err) {
        toast.error("Failed to delete chapter");
      }
    }
  };

  // --- CLASS CRUD OPERATIONS ---
  const handleAddNewClass = async () => {
    const { value: newClassName } = await Swal.fire({
      title: "Add New Class Level",
      input: "text",
      inputPlaceholder: "e.g. 11th Class",
      showCancelButton: true,
      confirmButtonText: "Add Class",
      inputValidator: (value) => {
        if (!value) return "Required!";
      },
    });

    if (newClassName) {
      try {
        await axios.post(`${BASE_URL}/api/subjects/classes/add`, {
          name: newClassName,
        });
        toast.success("Class Added Successfully!");
        fetchClasses();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed");
      }
    }
  };

  const handleEditClass = async () => {
    if (!filterClass) return toast.error("Select a class to edit first!");
    const selectedClassObj = classOptions.find((c) => c.name === filterClass);
    if (!selectedClassObj) return;

    const { value: newName } = await Swal.fire({
      title: "Edit Class Name",
      input: "text",
      inputValue: filterClass,
      showCancelButton: true,
      confirmButtonText: "Update Name",
      inputValidator: (value) => {
        if (!value) return "Required!";
      },
    });

    if (newName && newName !== filterClass) {
      try {
        await axios.put(
          `${BASE_URL}/api/subjects/classes/${selectedClassObj._id}`,
          { name: newName }
        );
        toast.success("Class Name Updated!");
        setFilterClass(newName);
        setFormData({ ...formData, className: newName });
        fetchClasses();
        fetchSubjects();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed");
      }
    }
  };

  const handleDeleteClass = async () => {
    if (!filterClass) return toast.error("Select a class first!");
    const selectedClassObj = classOptions.find((c) => c.name === filterClass);
    if (!selectedClassObj) return;

    const result = await Swal.fire({
      title: `Delete ${filterClass}?`,
      text: "This will remove the class permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Delete!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${BASE_URL}/api/subjects/classes/${selectedClassObj._id}`
        );
        toast.success("Class Deleted!");
        setFilterClass("");
        setFormData({ ...formData, className: "" });
        fetchClasses();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete");
      }
    }
  };

  // --- FORM HANDLERS ---
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

  const handleOpenChapterModal = () => {
    if (!formData.subjectId)
      return toast.error("Please select a subject first!");
    fetchChapters(formData.subjectId);
    setShowChapterModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // No Changes Check (Update Only)
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

    // Delete Confirmation
    if (operation === "delete") {
      if (!formData.subjectId) return toast.error("Please select a subject!");
      const result = await Swal.fire({
        title: "Delete Subject?",
        text: "This cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Yes, Delete!",
      });
      if (!result.isConfirmed) return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing request...");

    try {
      const data = new FormData();
      if (operation !== "delete") {
        data.append("subjectName", formData.subjectName);
        data.append("className", formData.className);
        data.append("year", formData.year);
        if (file) data.append("image", file);
      }

      if (operation === "add") {
        if (!file) throw new Error("Image is required!");
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
        toast.success("Subject Deleted!", { id: toastId });
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
        <div className="row g-4">
          {/* LEFT: Image Preview Section */}
          <div className="col-md-4 text-center border-end">
            <div className="image-preview-box">
              {!previewUrl && (
                <span className="text-muted fw-bold">No Image Selected</span>
              )}
              {previewUrl && (
                <>
                  {isImgLoading && <div className="spinner"></div>}
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
                  className="d-none"
                />
                <label
                  htmlFor="fileInput"
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  <FaCloudUploadAlt />{" "}
                  {operation === "update"
                    ? "Change Image"
                    : "Select Cover Image"}
                </label>
              </>
            )}
          </div>

          {/* RIGHT: Form Section */}
          <div className="col-md-8">
            <form onSubmit={handleSubmit}>
              {/* Operation Selector */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  Operation Mode
                </label>
                <select
                  className="form-select"
                  value={operation}
                  onChange={(e) => {
                    setOperation(e.target.value);
                    resetForm();
                  }}
                >
                  <option value="add">Add New Subject</option>
                  <option value="update">Update Subject</option>
                  <option value="delete">Delete Subject</option>
                </select>
              </div>

              {/* DYNAMIC SELECTION AREA (Update/Delete Mode) */}
              {(operation === "delete" || operation === "update") && (
                <div
                  className={`p-4 mb-4 rounded border ${
                    operation === "delete"
                      ? "bg-danger-subtle border-danger"
                      : "bg-light border-secondary"
                  }`}
                >
                  <h5
                    className={`mb-3 fw-bold ${
                      operation === "delete" ? "text-danger" : "text-dark"
                    }`}
                  >
                    {operation === "delete"
                      ? "Delete Subject"
                      : "Select Subject to Edit"}
                  </h5>

                  {/* Step 1: Filter Class */}
                  <div className="mb-3">
                    <label className="form-label small text-muted">
                      Step 1: Filter by Class
                    </label>
                    <div className="d-flex gap-2">
                      <select
                        className="form-select"
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

                      {filterClass && (
                        <>
                          <button
                            type="button"
                            className="btn btn-warning text-white"
                            onClick={handleEditClass}
                            title="Edit Class Name"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDeleteClass}
                            title="Delete Class"
                          >
                            <FaTrashAlt />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Select Subject */}
                  <div className="mb-2">
                    <label className="form-label small text-muted">
                      Step 2: Select Subject
                    </label>
                    <select
                      className="form-select"
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

                  {/* Manage Chapters Button */}
                  {operation === "update" && formData.subjectId && (
                    <div className="text-end mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm d-inline-flex align-items-center gap-2"
                        onClick={handleOpenChapterModal}
                      >
                        <FaFolderOpen /> Manage Chapters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* INPUT FIELDS (Add/Update Mode) */}
              {(operation === "add" ||
                (operation === "update" && formData.subjectId)) && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Subject Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={handleInputChange}
                      placeholder="e.g. Physics"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label mb-0">Class Level</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                        onClick={handleAddNewClass}
                      >
                        <FaPlus size={12} /> Add Class
                      </button>
                    </div>

                    <div className="d-flex gap-2">
                      <select
                        className="form-select"
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
                      {/* Edit button in Add Mode too for quick access */}
                      {formData.className && (
                        <button
                          type="button"
                          className="btn btn-warning text-white"
                          onClick={() => {
                            setFilterClass(formData.className);
                            handleEditClass();
                          }}
                          title="Edit Class"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Academic Year</label>
                    <input
                      type="text"
                      className="form-control"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {/* Main Action Button */}
              <button
                type="submit"
                className={`btn w-100 py-2 fw-bold ${
                  operation === "delete"
                    ? "btn-danger"
                    : operation === "add"
                    ? "btn-success"
                    : "btn-warning text-white"
                } ${loading ? "disabled" : ""}`}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : operation === "add" ? (
                  <FaPlus className="me-2" />
                ) : operation === "delete" ? (
                  <FaTrashAlt className="me-2" />
                ) : (
                  <FaSave className="me-2" />
                )}
                {getButtonText()}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- CHAPTERS MODAL --- */}
      {showChapterModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
              <h5 className="m-0 fw-bold">
                <FaFolderOpen className="me-2 text-warning" />
                Manage Chapters
              </h5>
              <button
                className="btn btn-link text-dark p-0"
                style={{ fontSize: "24px" }}
                onClick={() => setShowChapterModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Chapters List */}
            <div
              className="mb-4 border rounded bg-light p-2"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {subjectChapters.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No chapters added yet.
                </div>
              ) : (
                subjectChapters.map((ch) => (
                  <div
                    key={ch._id}
                    className="d-flex justify-content-between align-items-center bg-white p-2 mb-2 rounded shadow-sm border-start border-4 border-primary"
                  >
                    <span>
                      <strong>Ch {ch.chapterNumber}:</strong> {ch.name}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleEditChapter(ch)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteChapter(ch._id)}
                        title="Delete"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Chapter Form */}
            <form onSubmit={handleAddChapter} className="border-top pt-3">
              <h6 className="fw-bold mb-3">Add New Chapter</h6>
              <div className="d-flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="No."
                  className="form-control"
                  style={{ width: "80px" }}
                  value={newChapter.number}
                  onChange={(e) =>
                    setNewChapter({ ...newChapter, number: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Chapter Name"
                  className="form-control"
                  value={newChapter.name}
                  onChange={(e) =>
                    setNewChapter({ ...newChapter, name: e.target.value })
                  }
                />
              </div>
              <input
                type="text"
                placeholder="Description (Optional)"
                className="form-control mb-3"
                value={newChapter.desc}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, desc: e.target.value })
                }
              />
              <button
                type="submit"
                className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
              >
                <FaPlus /> Add Chapter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
